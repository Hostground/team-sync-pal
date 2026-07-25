<?php
namespace App\Controllers;

use App\{Auth, Db, View};

class TemplateController {
    public function index(): void {
        $rows = Db::all('SELECT t.*, at.name AS type_name FROM activity_templates t LEFT JOIN activity_types at ON at.id=t.type_id WHERE t.owner_id=? ORDER BY t.name', [Auth::id()]);
        $types = Db::all('SELECT id,name FROM activity_types WHERE active=1 ORDER BY name');
        View::render('templates/index', ['title'=>'Sjablonen','rows'=>$rows,'types'=>$types]);
    }
    public function store(): void {
        $name = trim($_POST['name'] ?? '');
        $title = trim($_POST['title'] ?? '');
        if (!$name || !$title) { header('Location: /templates'); return; }
        Db::q('INSERT INTO activity_templates (id,name,owner_id,title,type_id,duration_minutes,location,description) VALUES (?,?,?,?,?,?,?,?)',
              [Db::uuid(), $name, Auth::id(), $title, $_POST['type_id'] ?: null,
               $_POST['duration_minutes'] ? (int)$_POST['duration_minutes'] : null,
               $_POST['location'] ?: null, $_POST['description'] ?: null]);
        header('Location: /templates');
    }
    public function delete(array $p): void {
        Db::q('DELETE FROM activity_templates WHERE id=? AND owner_id=?', [$p['id'], Auth::id()]);
        header('Location: /templates');
    }
}
