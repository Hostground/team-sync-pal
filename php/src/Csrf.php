<?php
namespace App;

class Csrf {
    public static function token(): string {
        if (empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf'];
    }
    public static function check(?string $tok): void {
        if (!$tok || !hash_equals($_SESSION['csrf'] ?? '', $tok)) {
            http_response_code(419);
            exit('CSRF-token ongeldig');
        }
    }
    public static function field(): string {
        return '<input type="hidden" name="_csrf" value="'.htmlspecialchars(self::token()).'">';
    }
}
