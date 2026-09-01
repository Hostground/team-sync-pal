<?php
namespace App\Controllers;

use App\{Auth, Db, View, Mailer, Config, Turnstile};

class AdminController {
    public function users(): void {
        $rows = Db::all(
            "SELECT u.*, GROUP_CONCAT(r.role) AS roles
             FROM users u LEFT JOIN user_roles r ON r.user_id=u.id
             GROUP BY u.id ORDER BY u.created_at DESC");
        View::render('admin/users', ['title'=>'Gebruikers','rows'=>$rows]);
    }

    public function setRole(array $p): void {
        $role = $_POST['role'] ?? '';
        if (!in_array($role, ['admin','management','employee'], true)) { header('Location: /admin/users'); return; }
        // Voorkom dat de laatste admin gedegradeerd wordt
        if ($role !== 'admin') {
            $admins = (int)Db::one("SELECT COUNT(*) AS c FROM user_roles WHERE role='admin'")['c'];
            $isAdmin = Db::one("SELECT 1 FROM user_roles WHERE user_id=? AND role='admin'", [$p['id']]);
            if ($isAdmin && $admins <= 1) { header('Location: /admin/users?err=laatste_admin'); return; }
        }
        Db::q('DELETE FROM user_roles WHERE user_id=?', [$p['id']]);
        Db::q('INSERT INTO user_roles (id,user_id,role) VALUES (?,?,?)', [Db::uuid(), $p['id'], $role]);
        header('Location: /admin/users');
    }

    public function types(): void {
        $rows = Db::all('SELECT * FROM activity_types ORDER BY name');
        View::render('admin/types', ['title'=>'Activiteitstypes','rows'=>$rows]);
    }

    public function saveType(): void {
        $id = $_POST['id'] ?? '';
        $name = trim($_POST['name'] ?? '');
        $color = $_POST['color'] ?? '';
        if (!$name) { header('Location: /admin/types'); return; }
        if ($id) {
            Db::q('UPDATE activity_types SET name=?, color=?, active=? WHERE id=?',
                  [$name, $color ?: null, isset($_POST['active']) ? 1 : 0, $id]);
        } else {
            Db::q('INSERT INTO activity_types (id,name,color,active) VALUES (?,?,?,1)', [Db::uuid(), $name, $color ?: null]);
        }
        header('Location: /admin/types');
    }

    public function deleteType(array $p): void {
        Db::q('DELETE FROM activity_types WHERE id=?', [$p['id']]);
        header('Location: /admin/types');
    }

    public function smtp(): void {
        $current = Mailer::config();
        $fileCfg = Config::get('smtp') ?: [];
        $dbRows  = Db::all("SELECT `key`,`value` FROM settings WHERE `key` LIKE 'smtp.%'");
        $overridden = [];
        foreach ($dbRows as $r) $overridden[substr($r['key'],5)] = true;
        $flash = $_SESSION['flash_smtp'] ?? null; unset($_SESSION['flash_smtp']);
        View::render('admin/smtp', [
            'title'=>'SMTP',
            'cfg'=>$current,
            'fileCfg'=>$fileCfg,
            'overridden'=>$overridden,
            'flash'=>$flash,
        ]);
    }

    public function saveSmtp(): void {
        $fields = ['host','port','username','password','secure','from','fromName'];
        foreach ($fields as $f) {
            $v = $_POST[$f] ?? '';
            // Leeg + veld password: leeg opslaan overslaan zodat bestaand wachtwoord blijft
            if ($f === 'password' && $v === '') continue;
            if ($v === '') {
                Db::q("DELETE FROM settings WHERE `key`=?", ['smtp.'.$f]);
            } else {
                Db::q("INSERT INTO settings(`key`,`value`) VALUES(?,?)
                       ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)", ['smtp.'.$f, $v]);
            }
        }
        $_SESSION['flash_smtp'] = ['type'=>'ok','msg'=>'SMTP-instellingen opgeslagen.'];
        header('Location: /admin/smtp');
    }

    public function turnstile(): void {
        $flash = $_SESSION['flash_turnstile'] ?? null; unset($_SESSION['flash_turnstile']);
        View::render('admin/turnstile', [
            'title'   => 'Turnstile',
            'cfg'     => Turnstile::config(),
            'enabled' => Turnstile::enabled(),
            'flash'   => $flash,
        ]);
    }

    public function saveTurnstile(): void {
        foreach (['site_key','secret_key'] as $f) {
            $v = trim($_POST[$f] ?? '');
            if ($f === 'secret_key' && $v === '' && !empty($_POST['keep_secret'])) continue;
            if ($v === '') {
                Db::q("DELETE FROM settings WHERE `key`=?", ['turnstile.'.$f]);
            } else {
                Db::q("INSERT INTO settings(`key`,`value`) VALUES(?,?)
                       ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)", ['turnstile.'.$f, $v]);
            }
        }
        $_SESSION['flash_turnstile'] = ['type'=>'ok','msg'=>'Turnstile-instellingen opgeslagen.'];
        header('Location: /admin/turnstile');
    }

    public function testSmtp(): void {
        $to = trim($_POST['to'] ?? '');
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $_SESSION['flash_smtp'] = ['type'=>'err','msg'=>'Ongeldig e-mailadres.'];
            header('Location: /admin/smtp'); return;
        }
        $ok = Mailer::send($to, 'SMTP test — '.Config::get('app.name','Planning'),
            '<p>Dit is een testbericht vanuit je Planning-app.</p><p>Als je dit ontvangt is SMTP correct ingesteld.</p>',
            'Dit is een testbericht vanuit je Planning-app.');
        $_SESSION['flash_smtp'] = $ok
            ? ['type'=>'ok','msg'=>'Testmail verzonden naar '.$to]
            : ['type'=>'err','msg'=>'Verzenden mislukt. Controleer instellingen en serverlogs.'];
        header('Location: /admin/smtp');
    }
}
