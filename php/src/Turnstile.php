<?php
namespace App;

/**
 * Cloudflare Turnstile bot-controle.
 * Keys komen uit de settings-tabel (admin > Turnstile) of uit config/config.php
 * onder de sectie 'turnstile' (site_key / secret_key).
 * Zonder keys blijft de controle uit en werkt aanmelden/registreren gewoon.
 */
class Turnstile {
    public static function config(): array {
        $c = Config::get('turnstile') ?: [];
        try {
            $rows = Db::all("SELECT `key`,`value` FROM settings WHERE `key` LIKE 'turnstile.%'");
            foreach ($rows as $r) {
                $k = substr($r['key'], 10);
                if ($r['value'] !== '' && $r['value'] !== null) $c[$k] = $r['value'];
            }
        } catch (\Throwable $e) { /* settings-tabel bestaat nog niet */ }
        return $c;
    }

    public static function siteKey(): string {
        return (string)(self::config()['site_key'] ?? '');
    }

    public static function enabled(): bool {
        $c = self::config();
        return !empty($c['site_key']) && !empty($c['secret_key']);
    }

    /** Valideert de token uit het formulier bij Cloudflare. */
    public static function verify(?string $token, ?string $ip = null): bool {
        if (!self::enabled()) return true;
        $token = trim((string)$token);
        if ($token === '' || strlen($token) > 4096) return false;

        $post = ['secret' => self::config()['secret_key'], 'response' => $token];
        if ($ip) $post['remoteip'] = $ip;

        $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($post),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $res = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        if ($res === false) { error_log('[Turnstile] siteverify mislukt: '.$err); return false; }

        $data = json_decode($res, true);
        if (empty($data['success'])) {
            error_log('[Turnstile] geweigerd: '.json_encode($data['error-codes'] ?? []));
            return false;
        }
        return true;
    }

    /** HTML voor de widget (leeg als Turnstile uit staat). */
    public static function widget(string $action = ''): string {
        if (!self::enabled()) return '';
        return '<div class="cf-turnstile" data-sitekey="'.htmlspecialchars(self::siteKey()).'"'
            .($action ? ' data-action="'.htmlspecialchars($action).'"' : '')
            .' data-theme="auto"></div>'
            .'<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>';
    }
}
