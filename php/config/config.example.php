<?php
// Kopieer naar config.php en pas aan.
return [
    'app' => [
        'name'   => 'Planning',
        'url'    => 'https://planning.example.com', // zonder trailing slash
        'secret' => 'CHANGE_ME_random_string_min_32_chars',
        'timezone' => 'Europe/Brussels',
        'default_response_window_hours' => 24,
        'reminder_hours_before' => 2,
    ],
    'db' => [
        'host'    => 'localhost',
        'name'    => 'cpaneluser_planning',
        'user'    => 'cpaneluser_plan',
        'pass'    => 'CHANGE_ME',
        'charset' => 'utf8mb4',
    ],
    'smtp' => [
        'host'     => 'mail.example.com',
        'port'     => 587,
        'username' => 'noreply@example.com',
        'password' => 'CHANGE_ME',
        'secure'   => 'tls',              // tls | ssl | ''
        'from'     => 'noreply@example.com',
        'fromName' => 'Planning',
    ],
    'vapid' => [
        // Genereer met: php -r "require 'vendor/autoload.php'; print_r(Minishlink\WebPush\VAPID::createVapidKeys());"
        'subject'    => 'mailto:admin@example.com',
        'publicKey'  => '',
        'privateKey' => '',
    ],
    'webauthn' => [
        'rp_id'   => 'planning.example.com', // hostname zonder scheme/pad
        'rp_name' => 'Planning',
    ],
];
