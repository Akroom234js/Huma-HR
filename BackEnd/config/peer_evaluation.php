<?php

return [
    // Secret salt used for anonymous token generation (keep in .env)
    'salt' => env('PEER_EVAL_SALT'),

    // AES‑256‑CBC encryption key (base64‑encoded, keep in .env)
    'aes_key' => env('PEER_EVAL_AES_KEY'),

    // Weight of peer component in final score (percentage)
    'weight' => 15,
];
?>
