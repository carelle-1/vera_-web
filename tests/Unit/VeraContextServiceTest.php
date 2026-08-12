<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\VeraContextService;

class VeraContextServiceTest extends TestCase
{
    private function makeService(): VeraContextService
    {
        return new VeraContextService();
    }

    public function test_merge_extracted_context_adds_unique_items()
    {
        $service = $this->makeService();
        $profile = [
            'technologies' => ['Flutter'],
            'competences' => ['communication'],
            'nom' => 'Paul',
        ];
        $extracted = [
            'technologies' => ['Flutter', 'Django'],
            'competences' => ['communication', 'rigueur'],
            'nom' => 'Paul',
            'statut' => 'étudiant',
        ];
        $merged = $service->mergeExtractedContext($profile, $extracted);
        $this->assertEquals(['Flutter', 'Django'], $merged['technologies']);
        $this->assertEquals(['communication', 'rigueur'], $merged['competences']);
        $this->assertEquals('Paul', $merged['nom']);
        $this->assertEquals('étudiant', $merged['statut']);
    }

    public function test_build_final_reply_complete()
    {
        $service = $this->makeService();
        $analysis = [
            'status' => 'complete',
            'score' => 90,
            'criteria' => [
                'formation' => ['present' => true, 'comment' => ''],
                'experience' => ['present' => true, 'comment' => ''],
            ],
            'feedback' => 'Très bonne réponse.',
            'example_answer' => '',
            'improved_answer' => 'Je suis étudiant en informatique...',
            'next_action' => 'continue',
        ];
        $profile = ['statut' => 'étudiant', 'domaine' => 'informatique'];
        $reply = $service->generateInterviewReply($analysis, 'Parlez-moi de vous.', $profile, [], 'Je suis étudiant en informatique.');
        $this->assertStringContainsString('Très bonne réponse.', $reply);
        $this->assertStringContainsString('Réponse améliorée', $reply);
    }

    public function test_build_final_reply_partial()
    {
        $service = $this->makeService();
        $analysis = [
            'status' => 'partial',
            'score' => 60,
            'criteria' => [
                'formation' => ['present' => true, 'comment' => ''],
                'experience' => ['present' => false, 'comment' => ''],
            ],
            'feedback' => 'Réponse pertinente mais incomplète.',
            'example_answer' => '',
            'improved_answer' => '',
            'next_action' => 'continue',
        ];
        $reply = $service->generateInterviewReply($analysis, 'Parlez-moi de vous.', [], [], '');
        $this->assertStringContainsString('Votre réponse est pertinente car vous présentez formation', $reply);
        $this->assertStringContainsString('manque notamment experience', $reply);
    }

    public function test_build_final_reply_off_topic()
    {
        $service = $this->makeService();
        $analysis = [
            'status' => 'off_topic',
            'score' => 0,
            'criteria' => [],
            'feedback' => 'Vous ne répondez pas à la question.',
            'example_answer' => '',
            'improved_answer' => '',
            'next_action' => 'retry',
        ];
        $reply = $service->generateInterviewReply($analysis, 'Quelles sont vos motivations ?', [], [], '');
        $this->assertStringContainsString('ne répond pas directement à la question', $reply);
        $this->assertStringContainsString('Essayez maintenant de répondre à nouveau', $reply);
    }

    public function test_summarize_profile_empty()
    {
        $service = $this->makeService();
        $this->assertStringContainsString('aucune information connue', $service->summarizeProfile([]));
    }

    public function test_summarize_profile_with_data()
    {
        $service = $this->makeService();
        $profile = [
            'nom' => 'Paul',
            'statut' => 'étudiant',
            'technologies' => ['Flutter', 'Django'],
        ];
        $summary = $service->summarizeProfile($profile);
        $this->assertStringContainsString('nom : Paul', $summary);
        $this->assertStringContainsString('statut : étudiant', $summary);
        $this->assertStringContainsString('Flutter, Django', $summary);
    }
}
