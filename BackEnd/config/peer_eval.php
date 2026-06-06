<?php

return [
    // Secret salt used for peer evaluation token generation and comment encryption
    // Add the actual value in the .env file as PEER_EVAL_SALT
    'salt' => env('PEER_EVAL_SALT'),
];
?>
