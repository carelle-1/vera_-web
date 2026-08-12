<?php
require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\ChatController;
use App\Services\VeraContextService;
use Illuminate\Support\Facades\Http;

Http::fake([
    'http://localhost:11434/api/chat' => Http::response([
        'message' => [
            'content' => "📝 Feedback : Votre réponse est claire et pertinente.\n\n💡 Réponse modèle : Je m'appelle Carelle, je suis étudiante en informatique option génie logiciel, et je souhaite développer mes compétences en développement web et mobile pour construire des solutions utiles.\n\n❓ Question suivante : Quelles sont vos motivations pour ce poste ?",
        ],
    ], 200),
]);

$controller = new ChatController(new VeraContextService());
$method = new ReflectionMethod($controller, 'isUserMessageEcho');
$method->setAccessible(true);
$user = 'je me norme carelle étudiante en informatique option genie logiciel';
$reply = "Je m'appelle Carelle, je suis étudiante en informatique option génie logiciel, et je souhaite développer mes compétences en développement web et mobile pour construire des solutions utiles.";
var_dump($method->invoke($controller, $user, $reply));

$tokenMethod = new ReflectionMethod($controller, 'tokenizeInterviewText');
$tokenMethod->setAccessible(true);
$tokensUser = $tokenMethod->invoke($controller, $user);
$tokensReply = $tokenMethod->invoke($controller, $reply);
var_dump($tokensUser);
var_dump($tokensReply);
$overlap = count(array_intersect($tokensUser, $tokensReply));
var_dump($overlap);

$result = (new ReflectionMethod($controller, 'getAdaptiveInterviewReply'))->invoke($controller, $user, ['id' => 'intro', 'question' => 'Parlez-moi de vous.'], []);
echo "RESULT:\n" . $result . "\n";
