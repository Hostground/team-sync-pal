<?php
namespace App\Controllers;

use App\{Auth, Db, View};

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
}
