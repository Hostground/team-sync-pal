<?php
namespace App\Controllers;

use App\{Auth, Db, View};

class SettingsController {
    public function index(): void {
        $u = Db::one('SELECT * FROM users WHERE id = ?', [Auth::id()]);
        $vapid = \App\Config::get('vapid.publicKey');
        View::render('settings/index', ['title'=>'Instellingen','u'=>$u,'vapidKey'=>$vapid]);
    }
    public function save(): void {
        Db::q('UPDATE users SET full_name=?, phone=?, notif_email=?, notif_push=?, notif_inapp=? WHERE id=?',
              [trim($_POST['full_name'] ?? ''), $_POST['phone'] ?: null,
               isset($_POST['notif_email']) ? 1 : 0,
               isset($_POST['notif_push'])  ? 1 : 0,
               isset($_POST['notif_inapp']) ? 1 : 0,
               Auth::id()]);
        header('Location: /settings?saved=1');
    }
}
