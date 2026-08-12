<?php

namespace App\Services;

class OllamaService
{
    private string $url;

    public function __construct()
    {
        $this->url = rtrim((string) env('OLLAMA_URL', 'http://localhost:11434'), '/');
    }

    public function chat(array $messages, array $options = []): string
    {
        $model = (string) env('OLLAMA_MODEL', 'llama3.2:1b');

        $payload = [
            'model' => $model,
            'stream' => false,
            'messages' => $messages,
            'options' => array_merge([
                'temperature' => 0.7,
                'top_p' => 0.9,
                'max_tokens' => 800,
            ], $options),
        ];

        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => json_encode($payload),
                'timeout' => 120,
                'ignore_errors' => true,
            ],
        ]);

        $response = @file_get_contents($this->url . '/api/chat', false, $context);
        if ($response === false) {
            throw new \RuntimeException('Ollama request failed');
        }

        $data = json_decode($response, true);
        $reply = trim((string) ($data['message']['content'] ?? $data['response'] ?? ''));
        if ($reply !== '') {
            return $reply;
        }
        return trim((string) ($data['response'] ?? ''));
    }
}
