<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$apiKey = config('services.gemini.api_key');

// Test different combinations of version + model
$tests = [
    'v1beta/gemini-2.5-flash'     => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    'v1/gemini-2.5-flash'         => 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent',
    'v1beta/gemini-flash-latest'  => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    'v1/gemini-flash-latest'      => 'https://generativelanguage.googleapis.com/v1/models/gemini-flash-latest:generateContent',
    'v1beta/gemini-pro-latest'    => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent',
];

$body = json_encode([
    'contents' => [
        ['parts' => [['text' => 'Say: WORKING']]]
    ]
]);

foreach ($tests as $name => $url) {
    $ch = curl_init($url . '?key=' . $apiKey);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $body,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT        => 10,
    ]);
    $response = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "$name => HTTP $code\n";
    if ($code === 200) {
        echo "✅ WORKING MODEL FOUND: $name\n";
        break;
    }
}
