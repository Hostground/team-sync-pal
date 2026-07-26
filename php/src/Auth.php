<?php
namespace App;

class Auth {
    private static ?array $user = null;
    private static array $roles = [];

    public static function boot(): void {
        $uid = $_SESSION['uid'] ?? null;
        if (!$uid) return;
        self::$user = Db::one('SELECT * FROM users WHERE id = ?', [$uid]);
        if (!self::$user) { self::logout(); return; }
        $rs = Db::all('SELECT role FROM user_roles WHERE user_id = ?', [$uid]);
        self::$roles = array_map(fn($r) => $r['role'], $rs);
    }

    public static function login(string $email, string $password): bool {
        $u = Db::one('SELECT * FROM users WHERE email = ?', [strtolower(trim($email))]);
        if (!$u || !password_verify($password, $u['password_hash'])) return false;
        session_regenerate_id(true);
        $_SESSION['uid'] = $u['id'];
        self::boot();
        return true;
    }

    public static function loginById(string $uid): void {
        session_regenerate_id(true);
        $_SESSION['uid'] = $uid;
        self::boot();
    }

    public static function register(string $email, string $password, string $fullName): array {
        $email = strtolower(trim($email));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \RuntimeException('Ongeldig e-mailadres.');
        }
        // Server-side password strength check (cannot be bypassed by skipping client validation).
        if (strlen($password) < 10) {
            throw new \RuntimeException('Wachtwoord moet minstens 10 tekens bevatten.');
        }
        if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
            throw new \RuntimeException('Wachtwoord moet minstens één letter en één cijfer bevatten.');
        }
        if (trim($fullName) === '') {
            throw new \RuntimeException('Volledige naam is verplicht.');
        }
        if (Db::one('SELECT id FROM users WHERE email = ?', [$email])) {
            throw new \RuntimeException('E-mailadres is al in gebruik.');
        }
        $id = Db::uuid();
        Db::q('INSERT INTO users (id,email,password_hash,full_name) VALUES (?,?,?,?)',
              [$id, $email, password_hash($password, PASSWORD_BCRYPT), $fullName]);
        // First user becomes admin, others employee
        $count = (int)Db::one('SELECT COUNT(*) AS c FROM user_roles')['c'];
        $role = $count === 0 ? 'admin' : 'employee';
        Db::q('INSERT INTO user_roles (id,user_id,role) VALUES (?,?,?)', [Db::uuid(), $id, $role]);
        return ['id' => $id, 'role' => $role];
    }

    public static function logout(): void {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time()-42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
        self::$user = null;
        self::$roles = [];
    }

    public static function user(): ?array { return self::$user; }
    public static function id(): ?string  { return self::$user['id'] ?? null; }
    public static function roles(): array { return self::$roles; }
    public static function isStaff(): bool { return (bool)array_intersect(self::$roles, ['admin','management']); }
    public static function isAdmin(): bool { return in_array('admin', self::$roles, true); }
    public static function primaryRole(): string {
        foreach (['admin','management','employee'] as $r) if (in_array($r, self::$roles, true)) return $r;
        return 'employee';
    }
}
