<?php

namespace Tests\Unit;

use App\Http\Controllers\ChatController;
use App\Services\VeraContextService;
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
}
