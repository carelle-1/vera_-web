<?php

namespace Tests\Unit;

use App\Http\Controllers\ChatController;
use App\Services\VeraContextService;
use Illuminate\Support\Facades\Http;
use ReflectionMethod;
use Tests\TestCase;

class InterviewReplyGuardTest extends TestCase
{
    public function test_it_rejects_raw_user_message_when_model_echoes_it_back(): void
    {
        $controller = new ChatController(new VeraContextService());
        $method = new ReflectionMethod($controller, 'isUserMessageEcho');
        $method->setAccessible(true);

        $message = "Je suis développeur web full stack avec 3 ans d'expérience et j'utilise Laravel, React et PostgreSQL.";

        $this->assertTrue($method->invoke($controller, $message, $message));
        $this->assertFalse($method->invoke($controller, "Je suis développeur web full stack, motivé par les projets utiles et je maîtrise Laravel, React et PostgreSQL.", $message));
    }

    public function test_it_reformulates_the_answer_when_profile_is_missing(): void
    {
        $controller = new ChatController(new VeraContextService());
        $method = new ReflectionMethod($controller, 'buildPersonalizedModelAnswer');
        $method->setAccessible(true);

        $message = "Je suis développeur web full stack avec 3 ans d'expérience et j'utilise Laravel, React et PostgreSQL.";
        $answer = $method->invoke($controller, $message, ['id' => 'intro'], []);

        $this->assertNotSame($message, $answer);
        $this->assertStringContainsString('Je suis', $answer);
        $this->assertStringContainsString('Laravel', $answer);
    }

    public function test_it_uses_the_users_actual_motivation_in_the_model_answer(): void
    {
        $controller = new ChatController(new VeraContextService());
        $method = new ReflectionMethod($controller, 'buildPersonalizedModelAnswer');
        $method->setAccessible(true);

        $question = ['id' => 'values', 'question' => 'Quelles sont vos motivations pour ce poste ?'];
        $message = 'ma motivation pour ce poste est le travail, la discipline';

        $answer = $method->invoke($controller, $message, $question, []);
        $lowerAnswer = mb_strtolower($answer, 'UTF-8');

        $this->assertStringContainsString('travail', $lowerAnswer);
        $this->assertStringContainsString('discipline', $lowerAnswer);
        $this->assertStringContainsString('motivation', $lowerAnswer);
    }

    public function test_it_does_not_treat_help_requests_as_real_interview_answers(): void
    {
        $controller = new ChatController(new VeraContextService());
        $method = new ReflectionMethod($controller, 'getInterviewReply');
        $method->setAccessible(true);

        $result = $method->invoke($controller, 'Aide-moi à préparer une réponse pour cette question. Donne-moi un exemple structuré.', 1, []);

        $this->assertStringNotContainsString('✅ Bonne réponse.', $result['reply']);
        $this->assertStringContainsString('Réponse modèle', $result['reply']);
        $this->assertSame(1, $result['nextStep']);
    }

    public function test_it_keeps_the_user_specific_ollama_answer_instead_of_overwriting_it_with_the_generic_template(): void
    {
        Http::fake([
            'http://127.0.0.1:11434/api/chat' => Http::response([
                'message' => [
                    'content' => "📝 Feedback : Votre réponse est claire et pertinente.\n\n💡 Réponse modèle : Je m'appelle Carelle, je suis étudiante en informatique option génie logiciel, et je souhaite développer mes compétences en développement web et mobile pour construire des solutions utiles.\n\n❓ Question suivante : Quelles sont vos motivations pour ce poste ?",
                ],
            ], 200),
        ]);

        $controller = new ChatController(new VeraContextService());
        $method = new ReflectionMethod($controller, 'getAdaptiveInterviewReply');
        $method->setAccessible(true);

        $reply = $method->invoke($controller, 'je me norme carelle étudiante en informatique option genie logiciel', ['id' => 'intro', 'question' => 'Parlez-moi de vous.'], []);

        $this->assertStringContainsString('Carelle', $reply);
        $this->assertStringContainsString('étudiante', $reply);
        $this->assertStringContainsString('informatique', $reply);
        $this->assertStringNotContainsString('Je suis le développement motivé(e)', $reply);
    }

}
