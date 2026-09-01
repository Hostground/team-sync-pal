<?php
namespace App\Controllers;

use App\{Auth, Db, View, Csrf, Turnstile};

class AuthController {
    public function root(): void {
        if (Auth::user()) { header('Location: /planning'); exit; }
        header('Location: /login'); exit;
    }

    public function showLogin(): void {
        View::render('auth/login', ['title' => 'Aanmelden', 'error' => $_GET['error'] ?? null]);
    }

    public function login(): void {
        $email = $_POST['email'] ?? '';
        $pass  = $_POST['password'] ?? '';
        if (!Turnstile::verify($_POST['cf-turnstile-response'] ?? null, $_SERVER['REMOTE_ADDR'] ?? null)) {
            header('Location: /login?error=captcha'); exit;
        }
        if (!Auth::login($email, $pass)) { header('Location: /login?error=1'); exit; }
        header('Location: /planning'); exit;
    }

    public function showRegister(): void {
        View::render('auth/register', ['title' => 'Registreren']);
    }

    public function register(): void {
        try {
            if (!Turnstile::verify($_POST['cf-turnstile-response'] ?? null, $_SERVER['REMOTE_ADDR'] ?? null)) {
                throw new \RuntimeException('Bot-controle mislukt. Probeer opnieuw.');
            }
            $u = Auth::register(
                $_POST['email'] ?? '',
                $_POST['password'] ?? '',
                trim($_POST['full_name'] ?? '')
            );
            Auth::loginById($u['id']);
            header('Location: /planning'); exit;
        } catch (\Throwable $e) {
            View::render('auth/register', ['title'=>'Registreren','error'=>$e->getMessage()]);
        }
    }

    public function logout(): void { Auth::logout(); header('Location: /login'); exit; }

    // --- WebAuthn (vereenvoudigd; slaat challenge in sessie op) ---
    public function webauthnRegisterOptions(): void {
        if (!Auth::user()) { http_response_code(401); return; }
        $challenge = random_bytes(32);
        $_SESSION['wa_challenge'] = base64_encode($challenge);
        $rp = \App\Config::get('webauthn');
        header('Content-Type: application/json');
        echo json_encode([
            'challenge' => self::b64url($challenge),
            'rp' => ['id' => $rp['rp_id'], 'name' => $rp['rp_name']],
            'user' => [
                'id' => self::b64url(Auth::id()),
                'name' => Auth::user()['email'],
                'displayName' => Auth::user()['full_name'],
            ],
            'pubKeyCredParams' => [
                ['type'=>'public-key','alg'=>-7],
                ['type'=>'public-key','alg'=>-257],
            ],
            'authenticatorSelection' => ['userVerification' => 'preferred', 'residentKey' => 'preferred'],
            'timeout' => 60000,
            'attestation' => 'none',
        ]);
    }

    public function webauthnRegisterVerify(): void {
        if (!Auth::user()) { http_response_code(401); return; }
        $in = json_decode(file_get_contents('php://input') ?: '{}', true);
        $credId = self::b64urlDecode($in['id'] ?? '');
        $pub    = $in['publicKey'] ?? ''; // client stuurt geëxporteerde public key (base64)
        if (!$credId || !$pub) { http_response_code(400); echo 'invalid'; return; }
        Db::q('INSERT INTO webauthn_credentials (id,user_id,credential_id,public_key,label) VALUES (?,?,?,?,?)',
              [Db::uuid(), Auth::id(), $credId, $pub, $in['label'] ?? 'Vingerafdruk']);
        Db::q('UPDATE users SET biometric_enabled = 1 WHERE id = ?', [Auth::id()]);
        header('Content-Type: application/json'); echo json_encode(['ok'=>true]);
    }

    public function webauthnLoginOptions(): void {
        $in = json_decode(file_get_contents('php://input') ?: '{}', true);
        $email = strtolower(trim($in['email'] ?? ''));
        $u = Db::one('SELECT id FROM users WHERE email = ?', [$email]);
        if (!$u) { http_response_code(404); echo 'unknown user'; return; }
        $creds = Db::all('SELECT credential_id FROM webauthn_credentials WHERE user_id = ?', [$u['id']]);
        if (!$creds) { http_response_code(404); echo 'no credentials'; return; }
        $challenge = random_bytes(32);
        $_SESSION['wa_challenge'] = base64_encode($challenge);
        $_SESSION['wa_user_id'] = $u['id'];
        header('Content-Type: application/json');
        echo json_encode([
            'challenge' => self::b64url($challenge),
            'rpId' => \App\Config::get('webauthn.rp_id'),
            'timeout' => 60000,
            'userVerification' => 'preferred',
            'allowCredentials' => array_map(fn($c) => [
                'type' => 'public-key',
                'id'   => self::b64url($c['credential_id']),
            ], $creds),
        ]);
    }

    public function webauthnLoginVerify(): void {
        // SECURITY: A proper WebAuthn assertion verification is required here (verify
        // clientDataJSON origin/type, authenticatorData RP ID hash and flags, the
        // stored challenge, and the assertion signature against the stored public key).
        // The previous implementation only checked that a credential row existed for
        // the user, which allowed anyone knowing a victim's email to sign in as them.
        // Disable this endpoint until a vetted WebAuthn library (e.g. web-auth/webauthn-lib)
        // is wired up.
        unset($_SESSION['wa_challenge'], $_SESSION['wa_user_id']);
        http_response_code(501);
        header('Content-Type: application/json');
        echo json_encode([
            'ok' => false,
            'error' => 'Biometrische aanmelding is tijdelijk uitgeschakeld. Meld u aan met e-mail en wachtwoord.',
        ]);
    }

    private static function b64url(string $b): string { return rtrim(strtr(base64_encode($b), '+/', '-_'), '='); }
    private static function b64urlDecode(string $s): string {
        $s = strtr($s, '-_', '+/');
        $pad = strlen($s) % 4; if ($pad) $s .= str_repeat('=', 4 - $pad);
        return base64_decode($s) ?: '';
    }
}
