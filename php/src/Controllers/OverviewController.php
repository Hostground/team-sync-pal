<?php
namespace App\Controllers;

use App\{Auth, Db, View};

class OverviewController {
    public function index(): void {
        $where = '1=1'; $params = [];
        if (!empty($_GET['status'])) { $where .= ' AND a.status = ?'; $params[] = $_GET['status']; }
        if (!empty($_GET['assignee'])) { $where .= ' AND a.assignee_id = ?'; $params[] = $_GET['assignee']; }
        if (!empty($_GET['type'])) { $where .= ' AND a.type_id = ?'; $params[] = $_GET['type']; }
        if (!empty($_GET['from'])) { $where .= ' AND a.start_at >= ?'; $params[] = $_GET['from'].' 00:00:00'; }
        if (!empty($_GET['to']))   { $where .= ' AND a.start_at <= ?'; $params[] = $_GET['to'].' 23:59:59'; }

        $rows = Db::all(
            "SELECT a.*, u.full_name AS assignee_name, t.name AS type_name,
                    (SELECT COUNT(*) FROM notifications n WHERE n.activity_id=a.id AND n.read_at IS NULL) AS unread_count,
                    (SELECT COUNT(*) FROM notifications n WHERE n.activity_id=a.id) AS notif_count
             FROM activities a
             LEFT JOIN users u ON u.id=a.assignee_id
             LEFT JOIN activity_types t ON t.id=a.type_id
             WHERE $where
             ORDER BY a.start_at DESC LIMIT 200", $params);

        if (!empty($_GET['unread_only'])) {
            $rows = array_values(array_filter($rows, fn($r) => (int)$r['unread_count'] > 0));
        }

        // Per-activity delivery samenvatting
        $ids = array_column($rows, 'id');
        $summary = [];
        if ($ids) {
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $ds = Db::all(
                "SELECT n.activity_id, d.channel, d.status, COUNT(*) AS c
                 FROM notification_deliveries d
                 JOIN notifications n ON n.id=d.notification_id
                 WHERE n.activity_id IN ($ph)
                 GROUP BY n.activity_id, d.channel, d.status", $ids);
            foreach ($ds as $r) $summary[$r['activity_id']][$r['channel']][$r['status']] = (int)$r['c'];
        }

        $employees = Db::all("SELECT DISTINCT u.id, u.full_name FROM users u JOIN user_roles r ON r.user_id=u.id ORDER BY u.full_name");
        $types = Db::all('SELECT id,name FROM activity_types ORDER BY name');

        // Agenda-events: zelfde filters (behalve datum), ruim bereik rond nu
        $cw = '1=1'; $cp = [];
        if (!empty($_GET['status']))   { $cw .= ' AND a.status = ?';      $cp[] = $_GET['status']; }
        if (!empty($_GET['assignee'])) { $cw .= ' AND a.assignee_id = ?'; $cp[] = $_GET['assignee']; }
        if (!empty($_GET['type']))     { $cw .= ' AND a.type_id = ?';     $cp[] = $_GET['type']; }
        $events = Db::all(
            "SELECT a.id, a.title, a.start_at, a.end_at, a.status, a.location, a.customer,
                    u.full_name AS assignee_name, t.name AS type_name, t.color AS type_color
             FROM activities a
             LEFT JOIN users u ON u.id=a.assignee_id
             LEFT JOIN activity_types t ON t.id=a.type_id
             WHERE $cw AND a.start_at >= DATE_SUB(NOW(), INTERVAL 18 MONTH)
                       AND a.start_at <= DATE_ADD(NOW(), INTERVAL 18 MONTH)
             ORDER BY a.start_at LIMIT 3000", $cp);

        $calendar = array_map(fn($r) => [
            'id' => $r['id'], 'title' => $r['title'], 'start' => $r['start_at'], 'end' => $r['end_at'],
            'status' => $r['status'], 'type' => $r['type_name'], 'color' => $r['type_color'],
            'assignee' => $r['assignee_name'], 'location' => $r['location'], 'customer' => $r['customer'],
        ], $events);

        View::render('overzicht/index', [
            'title'=>'Overzicht','rows'=>$rows,'summary'=>$summary,
            'employees'=>$employees,'types'=>$types,'filters'=>$_GET,'calendar'=>$calendar,
        ]);
    }
}

