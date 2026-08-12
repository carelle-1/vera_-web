<?php
require 'vendor/autoload.php';

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
$result = (new ReflectionMethod($controller, 'getAdaptiveInterviewReply'))->invoke($controller, 'je me norme carelle étudiante en informatique option genie logiciel', ['id' => 'intro', 'question' => 'Parlez-moi de vous.'], []);
echo $result;
