<?php
namespace App\Controllers;

use App\{Auth, Db, View, Notifier};

class NotificationController {
    public function index(): void {
        $rows = Db::all(
            'SELECT n.*, a.title AS activity_title
             FROM notifications n LEFT JOIN activities a ON a.id=n.activity_id
             WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 100',
            [Auth::id()]);
        View::render('notifications/index', ['title'=>'Meldingen','rows'=>$rows]);
    }

    public function markRead(): void {
        $id = $_POST['id'] ?? null;
        Notifier::markRead(Auth::id(), $id ?: null);
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH'])) { echo 'ok'; return; }
        header('Location: /notifications');
    }

    public function subscribe(): void {
        $data = json_decode(file_get_contents('php://input') ?: '{}', true);
        $ep = $data['endpoint'] ?? '';
        $p  = $data['keys']['p256dh'] ?? '';
        $a  = $data['keys']['auth']   ?? '';
        if (!$ep || !$p || !$a) { http_response_code(400); echo 'invalid'; return; }
        $existing = Db::one('SELECT id FROM push_subscriptions WHERE endpoint = ?', [$ep]);
        if ($existing) {
            Db::q('UPDATE push_subscriptions SET p256dh=?, auth=?, user_id=? WHERE id=?', [$p, $a, Auth::id(), $existing['id']]);
        } else {
            Db::q('INSERT INTO push_subscriptions (id,user_id,endpoint,p256dh,auth,user_agent) VALUES (?,?,?,?,?,?)',
                  [Db::uuid(), Auth::id(), $ep, $p, $a, substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250)]);
        }
        echo 'ok';
    }
}
