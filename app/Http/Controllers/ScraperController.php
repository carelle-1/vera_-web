<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Database;
use Illuminate\Support\Facades\Http;
use DOMDocument;
use DOMXPath;

class ScraperController extends Controller
{
    protected $database;

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    public function scrapeAll(Request $request)
    {
        try {
            $sitesRef = $this->database->getReference('sites');
            $sitesSnapshot = $sitesRef->getSnapshot();
            $rawSites = $sitesSnapshot->getValue();
            $sites = is_array($rawSites) ? $rawSites : [];

            $activeSites = array_filter($sites, function($site) {
                return ($site['status'] ?? 'active') === 'active';
            });

            \Log::info('[SCRAPER] sites actifs: ' . count($activeSites) . ' sur ' . count($sites) . ' au total');

            if (empty($activeSites)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Aucun site actif à scraper.',
                    'scraped' => 0
                ]);
            }

            $jobsRef = $this->database->getReference('jobs');
            $existingJobsSnapshot = $jobsRef->getSnapshot();
            $rawExistingJobs = $existingJobsSnapshot->getValue();
            $existingJobs = is_array($rawExistingJobs) ? $rawExistingJobs : [];
            $existingUrls = [];
            
            foreach ($existingJobs as $job) {
                if (!empty($job['sourceUrl'])) {
                    $existingUrls[$job['sourceUrl']] = true;
                }
            }

            $scrapedCount = 0;
            $errors = [];

            foreach ($activeSites as $siteId => $site) {
                try {
                    $url = $site['url'] ?? '';
                    if (empty($url)) continue;

                    $hasSelectors = !empty($site['selectorTitle']);
                    \Log::info("[SCRAPER] site: {$site['name']} url: {$url} selecteurs: " . ($hasSelectors ? 'oui' : 'non'));

                    $jobs = !empty($site['selectorTitle']) 
                        ? $this->scrapeSiteWithSelectors($url, $site) 
                        : $this->scrapeSite($url, $site['name'] ?? 'Site');

                    \Log::info("[SCRAPER] site: {$site['name']} offres trouvees: " . count($jobs));

                    foreach ($jobs as $job) {
                        if (isset($existingUrls[$job['sourceUrl']])) {
                            continue;
                        }

                        $newJobRef = $jobsRef->push();
                        $newJobRef->set(array_merge($job, [
                            'createdAt' => time(),
                            'status' => 'active',
                            'source' => 'scraped',
                            'sourceSiteId' => $siteId
                        ]));
                        
                        $existingUrls[$job['sourceUrl']] = true;
                        $scrapedCount++;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Erreur sur {$site['name']}: " . $e->getMessage();
                    \Log::error("[SCRAPER] erreur site {$site['name']}: " . $e->getMessage());
                }
            }

            \Log::info("[SCRAPER] total scraped: {$scrapedCount}");

            return response()->json([
                'success' => true,
                'scraped' => $scrapedCount,
                'errors' => $errors,
                'message' => $scrapedCount > 0 
                    ? "{$scrapedCount} offre(s) scrapée(s) avec succès."
                    : "Aucune nouvelle offre trouvée."
            ]);

        } catch (\Exception $e) {
            \Log::error("[SCRAPER] erreur globale: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function scrapeSite(string $baseUrl, string $siteName): array
    {
        $jobs = [];
        
        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language' => 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                ])
                ->get($baseUrl);

            if (!$response->successful()) {
                return $jobs;
            }

            $html = $response->body();
            $doc = new DOMDocument();
            @$doc->loadHTML($html);
            $xpath = new DOMXPath($doc);

            $jobKeywords = ['job', 'emploi', 'career', 'recrutement', 'poste', 'offre', 'hiring', 'vacancy', 'opportunity'];
            
            $links = $xpath->query('//a[contains(@href, "job") or contains(@href, "emploi") or contains(@href, "career") or contains(@href, "recrutement") or contains(@href, "poste") or contains(@href, "offre") or contains(@href, "hiring") or contains(@href, "vacancy") or contains(@href, "opportunity")]');
            
            if ($links->length === 0) {
                $links = $xpath->query('//a[contains(@href, ".html")] | //a[contains(@href, "/")]');
            }
            
            $processedUrls = [];
            $maxJobs = 20;

            foreach ($links as $link) {
                if (count($jobs) >= $maxJobs) break;

                $href = $link->getAttribute('href');
                if (empty($href) || str_starts_with($href, 'javascript:') || str_starts_with($href, '#')) {
                    continue;
                }

                $fullUrl = $this->resolveUrl($baseUrl, $href);
                if (in_array($fullUrl, $processedUrls)) continue;
                $processedUrls[] = $fullUrl;

                $title = trim($link->textContent);
                if (strlen($title) < 10 || strlen($title) > 200) continue;

                $jobTitle = $this->extractJobTitle($title);
                if (empty($jobTitle)) continue;

                $parent = $link->parentNode;
                $contextText = '';
                for ($i = 0; $i < 5 && $parent; $i++) {
                    $contextText .= ' ' . $parent->textContent;
                    $parent = $parent->parentNode;
                }
                
                $company = $this->extractCompany($contextText, $siteName);
                $location = $this->extractLocation($contextText);
                $salary = $this->extractSalary($contextText);
                $logoData = $this->extractLogo($doc, $baseUrl);

                $jobs[] = [
                    'title' => $jobTitle,
                    'company' => $company,
                    'location' => $location,
                    'country' => $location,
                    'salary' => $salary,
                    'salaryMin' => $this->extractSalaryNumber($salary) ?: 0,
                    'salaryMax' => $this->extractSalaryNumber($salary, true) ?: 0,
                    'period' => 'par mois',
                    'sourceUrl' => $fullUrl,
                    'sourceName' => $siteName,
                    'status' => 'active',
                    'contractType' => 'CDI',
                    'level' => 'Intermédiaire',
                    'skills' => '',
                    'logo' => $logoData['text'] ?? '',
                    'logoBg' => $logoData['bg'] ?? '#3b6bf5',
                    'logoURL' => $logoData['url'] ?? '',
                    'match' => rand(60, 95),
                    'locationTag' => $location ?: 'Sur site',
                    'posted' => rand(1, 30) . 'j',
                    'createdAt' => time()
                ];
            }

        } catch (\Exception $e) {
            \Log::error("Scraping error for {$baseUrl}: " . $e->getMessage());
        }

        return $jobs;
    }

    private function scrapeSiteWithSelectors(string $baseUrl, array $site): array
    {
        $jobs = [];
        
        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language' => 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                ])
                ->get($baseUrl);

            if (!$response->successful()) {
                \Log::warning("[SCRAPER] HTTP error for {$baseUrl}: " . $response->status());
                return $jobs;
            }

            $html = $response->body();
            $doc = new DOMDocument();
            @$doc->loadHTML($html);
            $xpath = new DOMXPath($doc);

            $selectorTitle = $site['selectorTitle'] ?? '';
            $selectorCompany = $site['selectorCompany'] ?? '';
            $selectorLocation = $site['selectorLocation'] ?? '';
            $selectorSalary = $site['selectorSalary'] ?? '';
            $selectorLink = $site['selectorLink'] ?? '';
            $selectorDescription = $site['selectorDescription'] ?? '';
            $selectorCompanyEmail = $site['selectorCompanyEmail'] ?? '';

            if (!$selectorTitle) {
                return $jobs;
            }

            $titleXPath = $this->cssToXPath($selectorTitle);
            \Log::info("[SCRAPER] XPath titre pour {$baseUrl}: {$titleXPath}");
            
            $titleNodes = $xpath->query($titleXPath);
            \Log::info("[SCRAPER] noeuds titre trouves: " . $titleNodes->length);
            
            if ($titleNodes->length === 0) {
                return $jobs;
            }

            $maxJobs = 20;
            $count = 0;

            foreach ($titleNodes as $titleNode) {
                if ($count >= $maxJobs) break;

                $title = trim($titleNode->textContent);
                if (empty($title)) continue;

                $company = '';
                if ($selectorCompany) {
                    $companyNodes = $xpath->query($this->cssToXPath($selectorCompany));
                    if ($companyNodes->length > 0) {
                        $company = trim($companyNodes->item(0)->textContent);
                    }
                }

                $location = '';
                if ($selectorLocation) {
                    $locationNodes = $xpath->query($this->cssToXPath($selectorLocation));
                    if ($locationNodes->length > 0) {
                        $location = trim($locationNodes->item(0)->textContent);
                    }
                }

                $salary = '';
                if ($selectorSalary) {
                    $salaryNodes = $xpath->query($this->cssToXPath($selectorSalary));
                    if ($salaryNodes->length > 0) {
                        $salary = trim($salaryNodes->item(0)->textContent);
                    }
                }

                $sourceUrl = $baseUrl;
                if ($selectorLink) {
                    $linkNodes = $xpath->query($this->cssToXPath($selectorLink));
                    if ($linkNodes->length > 0) {
                        $href = $linkNodes->item(0)->getAttribute('href');
                        if (!empty($href)) {
                            $sourceUrl = $this->resolveUrl($baseUrl, $href);
                        }
                    }
                }

                $description = '';
                if ($selectorDescription) {
                    $descNodes = $xpath->query($this->cssToXPath($selectorDescription));
                    if ($descNodes->length > 0) {
                        $description = trim($descNodes->item(0)->textContent);
                    }
                }

                $companyEmail = '';
                if ($selectorCompanyEmail) {
                    $emailNodes = $xpath->query($this->cssToXPath($selectorCompanyEmail));
                    if ($emailNodes->length > 0) {
                        $companyEmail = trim($emailNodes->item(0)->textContent);
                    }
                }

                $jobs[] = [
                    'title' => $title,
                    'company' => $company ?: ($site['name'] ?? 'Site'),
                    'location' => $location,
                    'country' => $location,
                    'salary' => $salary,
                    'salaryMin' => $this->extractSalaryNumber($salary) ?: 0,
                    'salaryMax' => $this->extractSalaryNumber($salary, true) ?: 0,
                    'period' => 'par mois',
                    'sourceUrl' => $sourceUrl,
                    'sourceName' => $site['name'] ?? 'Site',
                    'status' => 'active',
                    'contractType' => 'CDI',
                    'level' => 'Intermédiaire',
                    'skills' => '',
                    'description' => $description,
                    'applyEmail' => $companyEmail,
                    'logo' => '',
                    'logoBg' => '#3b6bf5',
                    'logoURL' => '',
                    'match' => rand(60, 95),
                    'locationTag' => $location ?: 'Sur site',
                    'posted' => rand(1, 30) . 'j',
                    'createdAt' => time()
                ];

                $count++;
            }

            \Log::info("[SCRAPER] offres extraites pour {$baseUrl}: {$count}");

        } catch (\Exception $e) {
            \Log::error("Scraping with selectors error for {$baseUrl}: " . $e->getMessage());
        }

        return $jobs;
    }

    private function cssToXPath(string $css): string
    {
        $css = trim($css);
        if (str_starts_with($css, '/') || str_starts_with(strtoupper($css), '/')) {
            return $css;
        }

        $parts = explode(',', $css);
        $xpaths = [];

        foreach ($parts as $part) {
            $part = trim($part);
            if (empty($part)) continue;

            $part = preg_replace('/\s*>\s*/', '>', $part);
            $part = preg_replace('/\s*\+\s*/', '+', $part);
            $part = preg_replace('/\s*~\s*/', '~', $part);
            $part = preg_replace('/\s+/', '//', $part);

            $converted = $this->convertCssSelector($part);
            if ($converted) {
                $xpaths[] = $converted;
            } else {
                $xpaths[] = '//' . $part;
            }
        }

        return implode(' | ', $xpaths);
    }

    private function convertCssSelector(string $selector): ?string
    {
        if (preg_match('/^\.([a-zA-Z0-9_-]+)$/', $selector, $matches)) {
            return '//*[contains(concat(" ", normalize-space(@class), " "), " ' . $matches[1] . ' ")]';
        }

        if (preg_match('/^#([a-zA-Z0-9_-]+)$/', $selector, $matches)) {
            return '//*[@id="' . $matches[1] . '"]';
        }

        if (preg_match('/^([a-zA-Z0-9]+)\.([a-zA-Z0-9_-]+)$/', $selector, $matches)) {
            return '//' . $matches[1] . '[contains(concat(" ", normalize-space(@class), " "), " ' . $matches[2] . ' ")]';
        }

        if (preg_match('/^([a-zA-Z0-9]+)#([a-zA-Z0-9_-]+)$/', $selector, $matches)) {
            return '//' . $matches[1] . '[@id="' . $matches[2] . '"]';
        }

        if (preg_match('/^([a-zA-Z0-9]+)$/', $selector)) {
            return '//' . $selector;
        }

        return null;
    }

    private function resolveUrl(string $baseUrl, string $relativeUrl): string
    {
        if (str_starts_with($relativeUrl, 'http://') || str_starts_with($relativeUrl, 'https://')) {
            return $relativeUrl;
        }
        
        if (str_starts_with($relativeUrl, '//')) {
            $scheme = parse_url($baseUrl, PHP_URL_SCHEME) ?: 'https';
            return $scheme . ':' . $relativeUrl;
        }
        
        if (str_starts_with($relativeUrl, '/')) {
            $base = parse_url($baseUrl);
            return ($base['scheme'] ?? 'https') . '://' . ($base['host'] ?? '') . $relativeUrl;
        }
        
        $basePath = dirname(parse_url($baseUrl, PHP_URL_PATH) ?? '');
        if ($basePath === '/' || $basePath === '\\') {
            $basePath = '';
        }
        
        return rtrim($baseUrl, '/') . '/' . ltrim($relativeUrl, '/');
    }

    private function extractJobTitle(string $text): string
    {
        $text = trim(preg_replace('/\s+/', ' ', $text));
        
        $text = preg_replace('/^(apply|view|click|see|find|browse|search|postuler|voir|cliquer)/i', '', $text);
        
        $words = explode(' ', $text);
        $titleWords = [];
        $stopWords = ['at', 'in', 'for', 'the', 'a', 'an', 'de', 'du', 'la', 'le', 'les', 'un', 'une', 'des', 'et', 'ou', 'pour', 'avec', 'chez', 'à', 'au', 'aux'];
        
        foreach ($words as $word) {
            $clean = trim($word, " -_,.;:!?()[]{}\"'");
            if (empty($clean)) continue;
            if (in_array(strtolower($clean), $stopWords)) continue;
            if (strlen($clean) > 30) continue;
            $titleWords[] = $clean;
            if (count($titleWords) >= 8) break;
        }
        
        return implode(' ', $titleWords);
    }

    private function extractCompany(string $context, string $default): string
    {
        if (preg_match('/by\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+in|\s+·|$)/i', $context, $matches)) {
            return trim($matches[1]);
        }
        
        if (preg_match('/ chez\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s|$)/i', $context, $matches)) {
            return trim($matches[1]);
        }
        
        return $default;
    }

    private function extractLocation(string $context): string
    {
        $locations = [];
        
        if (preg_match('/\b(Paris|Lyon|Marseille|Bordeaux|Toulouse|Nantes|Strasbourg|Lille|Montréal|Québec|Toronto|Casablanca|Abidjan|Dakar|Bamako|Ouagadougou|Kinshasa|Brazzaville|Libreville|Douala|Yaoundé|Cotonou|Porto-Novo|Bénin|Togo|Ghana|Sénégal|Mali|Burkina|Congo|RDC|Gabon|Cameroun|Niger|Tchad|Guinée|Mauritanie|Madagascar|Marseille|Nice|Nantes|Rennes|Grenoble|Toulon|Aix|Clermont|Dijon|Reims|Le Mans|Angers|Tours|Limoges|Clermont|Rouen|Caen|Brest|Metz|Nancy|Mulhouse|Strasbourg|Colmar|Perpignan|Montpellier|Nîmes|Aix-en-Provence|Avignon|Toulon|Béziers|Narbonne|Carcassonne|Albi|Rodez|Mende|Pau|Bayonne|Bordeaux|La Rochelle|Angoulême|Limoges|Guéret|Niort|Poitiers|Châtellerault|Le Mans|Alençon|Caen|Cherbourg|Rennes|Brest|Quimper|Lorient|Vannes|Saint-Brieuc|Lannion|Morlaix|Quimper|Brest|Rennes|Nantes|La Roche-sur-Yon|Les Sables-d\'Olonne|La Rochelle|Angoulême|Bordeaux|Dax|Mont-de-Marsan|Agen|Toulouse|Albi|Rodez|Mende|Nîmes|Montpellier|Béziers|Narbonne|Carcassonne|Perpignan|Pau|Bayonne|Tarbes|Lourdes|Toulouse|Carcassonne|Narbonne|Béziers|Montpellier|Nîmes|Avignon|Aix-en-Provence|Marseille|Toulon|Nice|Cannes|Antibes|Grasse|Draguignan|Fréjus|Saint-Raphaël|Ajaccio|Bastia|Porto-Vecchio)\b/i', $context, $matches)) {
            $locations[] = $matches[1];
        }
        
        if (preg_match('/\b(Remote|Hybride|Sur site|Télétravail|Home office)\b/i', $context, $matches)) {
            $locations[] = $matches[1];
        }
        
        return !empty($locations) ? $locations[0] : '';
    }

    private function extractSalary(string $context): string
    {
        if (preg_match('/(\d{1,2}[.,]?\d{0,2})\s*(?:k|K)?\s*€(?:\s*[-–]\s*(\d{1,2}[.,]?\d{0,2})\s*(?:k|K)?\s*€)?/', $context, $matches)) {
            if (isset($matches[2])) {
                return $matches[1] . ' – ' . $matches[2] . ' €';
            }
            return $matches[1] . ' €';
        }
        
        if (preg_match('/(\d{1,2}[.,]?\d{0,2})\s*(?:k|K)?\s*\$/', $context, $matches)) {
            return $matches[1] . ' $';
        }
        
        if (preg_match('/(\d{3,6})\s*(?:FCFA|XOF|XAF|francs?)/i', $context, $matches)) {
            return number_format((int)$matches[1], 0, ',', ' ') . ' FCFA';
        }
        
        return '';
    }

    private function extractSalaryNumber(string $salaryText, bool $isMax = false): int
    {
        if (empty($salaryText)) return 0;
        
        preg_match_all('/(\d{1,2}[.,]?\d{0,2})\s*(?:k|K)?/', $salaryText, $matches);
        
        if (!empty($matches[1])) {
            $numbers = array_map(function($num) {
                return (float)str_replace(',', '.', $num);
            }, $matches[1]);
            
            if ($isMax && count($numbers) > 1) {
                return (int)($numbers[1] * (str_contains($salaryText, 'k') || str_contains($salaryText, 'K') ? 1000 : 1));
            }
            
            return (int)($numbers[0] * (str_contains($salaryText, 'k') || str_contains($salaryText, 'K') ? 1000 : 1));
        }
        
        return 0;
    }

    private function extractLogo(DOMDocument $doc, string $baseUrl): array
    {
        $result = ['text' => '', 'bg' => '#3b6bf5', 'url' => ''];
        $xpath = new DOMXPath($doc);

        $logoImgs = $xpath->query('//img[contains(translate(@alt, "LOGO", "logo"), "logo")]');
        if ($logoImgs->length > 0) {
            $src = $logoImgs->item(0)->getAttribute('src');
            $result['url'] = $this->resolveUrl($baseUrl, $src);
            return $result;
        }

        $ogImage = $xpath->query('//meta[@property="og:image"]/@content | //meta[@name="og:image"]/@content');
        if ($ogImage->length > 0) {
            $result['url'] = $this->resolveUrl($baseUrl, $ogImage->item(0)->nodeValue);
            return $result;
        }

        $favicon = $xpath->query('//link[@rel="icon"]/@href | //link[@rel="shortcut icon"]/@href | //link[contains(@href, "favicon")]/@href');
        if ($favicon->length > 0) {
            $result['url'] = $this->resolveUrl($baseUrl, $favicon->item(0)->nodeValue);
            return $result;
        }

        return $result;
    }
}
