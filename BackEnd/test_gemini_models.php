<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$key = config('services.gemini.api_key');

$models = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];

foreach ($models as $m) {
    $res = Illuminate\Support\Facades\Http::post("https://generativelanguage.googleapis.com/v1beta/models/{$m}:generateContent?key=" . $key, [
        'contents' => [['parts' => [['text' => 'hello']]]]
    ]);
    echo "Model {$m} HTTP Code: " . $res->status() . "\n";
    if ($res->status() === 200) {
        echo "✅ SUCCESS with {$m}!\n";
    } else {
        echo "❌ " . substr($res->body(), 0, 150) . "\n";
    }
    echo "\n";
}
