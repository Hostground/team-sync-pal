<?php
namespace App\Controllers;

use App\{Auth, Db, View, Csrf, Notifier, Audit, Config};

class PlanningController {
    public function index(): void {
        $u = Auth::user();
        $where = '1=1'; $params = [];
        if (!Auth::isStaff()) { $where .= ' AND a.assignee_id = ?'; $params[] = $u['id']; }
        if (!empty($_GET['status']) && in_array($_GET['status'], ['pending','confirmed','declined','auto_declined','cancelled','completed'], true)) {
            $where .= ' AND a.status = ?'; $params[] = $_GET['status'];
        }
        if (!empty($_GET['rolling'])) { $where .= ' AND a.is_rolling = 1'; }
        $rows = Db::all(
            "SELECT a.*, u.full_name AS assignee_name, t.name AS type_name, t.color AS type_color
             FROM activities a
             LEFT JOIN users u ON u.id=a.assignee_id
             LEFT JOIN activity_types t ON t.id=a.type_id
             WHERE $where
             ORDER BY a.start_at DESC LIMIT 200",
            $params
        );
        View::render('planning/index', ['title'=>'Planning', 'rows'=>$rows]);
    }

    public function create(): void {
        $employees = Db::all("SELECT u.id, u.full_name FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.role='employee' ORDER BY u.full_name");
        $types = Db::all('SELECT id, name FROM activity_types WHERE active=1 ORDER BY name');
        $templates = Db::all('SELECT * FROM activity_templates WHERE owner_id = ? ORDER BY name', [Auth::id()]);
        View::render('planning/new', compact('employees','types','templates') + ['title'=>'Nieuwe activiteit', 'useMap'=>true]);
    }

    public function store(): void {
        $title = trim($_POST['title'] ?? '');
        $assignee = $_POST['assignee_id'] ?? '';
        $start = $_POST['start_at'] ?? '';
        $end   = $_POST['end_at'] ?? '';
        if (!$title || !$assignee || !$start || !$end) { header('Location: /planning/new?err=1'); exit; }

        $hours = (int)(Db::one("SELECT `value` FROM settings WHERE `key`='default_response_window_hours'")['value'] ?? 24);
        $custom = $_POST['response_window_hours'] ?? '';
        if ($custom !== '' && (int)$custom > 0) $hours = (int)$custom;

        $id = Db::uuid();
        $respondBy = (new \DateTime('now'))->modify("+{$hours} hours")->format('Y-m-d H:i:s');

        $isRolling = !empty($_POST['is_rolling']) ? 1 : 0;

        $lat = ($_POST['lat'] ?? '') !== '' ? (float)$_POST['lat'] : null;
        $lng = ($_POST['lng'] ?? '') !== '' ? (float)$_POST['lng'] : null;

        Db::q(
            'INSERT INTO activities
             (id,title,type_id,assignee_id,created_by,customer,start_at,end_at,location,description,respond_by,template_id,is_rolling,original_start_at,lat,lng)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [$id, $title, $_POST['type_id'] ?: null, $assignee, Auth::id(),
             $_POST['customer'] ?: null, $start, $end,
             $_POST['location'] ?: null, $_POST['description'] ?: null,
             $respondBy, $_POST['template_id'] ?: null, $isRolling, $start, $lat, $lng]
        );



        Audit::log($id, Auth::id(), 'created', null, 'pending');

        // Token voor e-mail-respond
        $tok = bin2hex(random_bytes(32));
        Db::q('INSERT INTO response_tokens (id,activity_id,token,expires_at) VALUES (?,?,?,?)',
              [Db::uuid(), $id, $tok, $respondBy]);

        $appUrl = Config::get('app.url');
        $confirmUrl = "$appUrl/respond?token=$tok&decision=confirmed";
        $declineUrl = "$appUrl/respond?token=$tok&decision=declined";

        $html = '<p>Je hebt een nieuwe activiteit toegewezen gekregen:</p>'
              . '<p><strong>'.htmlspecialchars($title).'</strong><br>'
              . 'Van '.htmlspecialchars($start).' tot '.htmlspecialchars($end).'</p>'
              . '<p>Reageer voor <strong>'.htmlspecialchars($respondBy).'</strong>.</p>'
              . '<p><a href="'.$confirmUrl.'">Bevestigen</a> &nbsp;|&nbsp; <a href="'.$declineUrl.'">Weigeren</a></p>'
              . '<p>Of open de app: <a href="'.$appUrl.'/planning/'.$id.'">bekijk activiteit</a></p>';

        Notifier::notify($assignee, 'activity_assigned',
            'Nieuwe activiteit: '.$title,
            'Reageren voor '.$respondBy, $id, $html, 'Nieuwe activiteit toegewezen');

        header('Location: /planning/'.$id); exit;
    }

    public function show(array $p): void {
        $a = Db::one(
            "SELECT a.*, u.full_name AS assignee_name, u.email AS assignee_email,
                    c.full_name AS creator_name, t.name AS type_name, t.color AS type_color
             FROM activities a
             LEFT JOIN users u ON u.id=a.assignee_id
             LEFT JOIN users c ON c.id=a.created_by
             LEFT JOIN activity_types t ON t.id=a.type_id
             WHERE a.id = ?", [$p['id']]);
        if (!$a) { http_response_code(404); View::render('errors/404', ['title'=>'Niet gevonden']); return; }
        if (!Auth::isStaff() && $a['assignee_id'] !== Auth::id()) { http_response_code(403); View::render('errors/403', ['title'=>'Geen toegang']); return; }

        $audit = Db::all(
            "SELECT al.*, u.full_name AS actor_name
             FROM activity_audit_log al LEFT JOIN users u ON u.id=al.actor_id
             WHERE al.activity_id = ? ORDER BY al.created_at DESC", [$p['id']]);

        $deliveries = [];
        if (Auth::isStaff()) {
            $deliveries = Db::all(
                "SELECT d.*, n.title AS notif_title, n.user_id AS notif_user, u.full_name AS user_name
                 FROM notification_deliveries d
                 JOIN notifications n ON n.id=d.notification_id
                 LEFT JOIN users u ON u.id=n.user_id
                 WHERE n.activity_id = ? ORDER BY d.created_at DESC", [$p['id']]);
        }

        $checklistTemplates = Db::all('SELECT id, name FROM checklist_templates ORDER BY name');
        $photos = Db::all('SELECT lat, lng FROM activity_photos WHERE activity_id = ?', [$p['id']]);

        $copyOptions = Auth::isStaff()
            ? Db::all("SELECT DISTINCT a.id, a.title FROM activities a
                       JOIN checklist_items c ON c.activity_id = a.id
                       WHERE a.id <> ? ORDER BY a.start_at DESC LIMIT 25", [$p['id']])
            : [];

        View::render('planning/show', [
            'title' => $a['title'], 'a' => $a, 'audit' => $audit, 'deliveries' => $deliveries,
            'checklistTemplates' => $checklistTemplates, 'copyOptions' => $copyOptions, 'useMap' => true, 'photos' => $photos,
        ]);
    }

    public function respond(array $p): void {
        $decision = $_POST['decision'] ?? '';
        $note = trim($_POST['note'] ?? '');
        if (!in_array($decision, ['confirmed','declined'], true)) { http_response_code(400); return; }
        $a = Db::one('SELECT * FROM activities WHERE id = ?', [$p['id']]);
        if (!$a) { http_response_code(404); return; }
        if ($a['assignee_id'] !== Auth::id()) { http_response_code(403); return; }
        if ($a['status'] !== 'pending') { header('Location: /planning/'.$p['id']); return; }
        Db::q('UPDATE activities SET status=?, responded_at=NOW(), response_note=? WHERE id=?',
              [$decision, $note ?: null, $p['id']]);
        Audit::log($p['id'], Auth::id(), $decision, 'pending', $decision, $note ?: null);
        // Notify management/admins
        $staff = Db::all("SELECT DISTINCT user_id FROM user_roles WHERE role IN ('admin','management')");
        $label = $decision === 'confirmed' ? 'bevestigd' : 'geweigerd';
        foreach ($staff as $s) {
            Notifier::notify($s['user_id'], 'activity_response',
                'Activiteit '.$label,
                Auth::user()['full_name'].' heeft "'.$a['title'].'" '.$label.($note ? ' – '.$note : ''),
                $p['id']);
        }
        header('Location: /planning/'.$p['id']); exit;
    }

    /** Markeer een activiteit als afgerond (toegewezen medewerker of staff). */
    public function complete(array $p): void {
        $a = Db::one('SELECT * FROM activities WHERE id = ?', [$p['id']]);
        if (!$a) { http_response_code(404); return; }
        if (!Auth::isStaff() && $a['assignee_id'] !== Auth::id()) { http_response_code(403); return; }
        if (in_array($a['status'], ['completed','cancelled'], true)) { header('Location: /planning/'.$p['id']); return; }

        Db::q('UPDATE activities SET status=?, completed_at=NOW(), completed_by=? WHERE id=?',
              ['completed', Auth::id(), $p['id']]);
        Audit::log($p['id'], Auth::id(), 'completed', $a['status'], 'completed',
                   !empty($_POST['auto']) ? 'Automatisch afgerond: alle taken afgevinkt' : null);

        if (!empty($_POST['json'])) {
            header('Content-Type: application/json');
            echo json_encode(['ok' => true]);
            return;
        }
        header('Location: /planning/'.$p['id']); exit;
    }
}
