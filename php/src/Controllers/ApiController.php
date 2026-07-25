<?php
namespace App\Controllers;

use App\{Auth, Db, View, Notifier, Audit};

class ApiController {
    /** GET /respond?token=&decision= — tokenlink uit e-mail */
    public function respondForm(): void {
        $tok = $_GET['token'] ?? '';
        $decision = $_GET['decision'] ?? '';
        $row = Db::one('SELECT rt.*, a.title, a.status FROM response_tokens rt JOIN activities a ON a.id=rt.activity_id WHERE rt.token = ?', [$tok]);
        if (!$row) { View::render('respond/invalid', ['title'=>'Ongeldige link']); return; }
        View::render('respond/form', ['title'=>'Reageren', 'row'=>$row, 'decision'=>$decision]);
    }

    public function respondSubmit(): void {
        $tok = $_POST['token'] ?? '';
        $decision = $_POST['decision'] ?? '';
        $note = trim($_POST['note'] ?? '');
        if (!in_array($decision, ['confirmed','declined'], true)) { http_response_code(400); return; }
        $row = Db::one('SELECT * FROM response_tokens WHERE token = ?', [$tok]);
        if (!$row) { View::render('respond/invalid', ['title'=>'Ongeldige link']); return; }
        if ($row['used_at']) { View::render('respond/invalid', ['title'=>'Al gebruikt']); return; }
        if (strtotime($row['expires_at']) < time()) { View::render('respond/invalid', ['title'=>'Verlopen']); return; }
        $a = Db::one('SELECT * FROM activities WHERE id = ?', [$row['activity_id']]);
        if (!$a || $a['status'] !== 'pending') { View::render('respond/invalid', ['title'=>'Niet beschikbaar']); return; }

        Db::q('UPDATE activities SET status=?, responded_at=NOW(), response_note=? WHERE id=?',
              [$decision, $note ?: null, $a['id']]);
        Db::q('UPDATE response_tokens SET used_at=NOW() WHERE id=?', [$row['id']]);
        Audit::log($a['id'], $a['assignee_id'], $decision, 'pending', $decision, $note ?: null);

        $staff = Db::all("SELECT DISTINCT user_id FROM user_roles WHERE role IN ('admin','management')");
        $label = $decision === 'confirmed' ? 'bevestigd' : 'geweigerd';
        $who = Db::one('SELECT full_name FROM users WHERE id = ?', [$a['assignee_id']])['full_name'] ?? 'Medewerker';
        foreach ($staff as $s) {
            Notifier::notify($s['user_id'], 'activity_response',
                'Activiteit '.$label,
                $who.' heeft "'.$a['title'].'" '.$label.($note ? ' – '.$note : ''),
                $a['id']);
        }
        View::render('respond/done', ['title'=>'Bedankt', 'decision'=>$decision]);
    }
}
