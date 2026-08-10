<?php
namespace App\Controllers;

use App\{Auth, Db, View, Csrf};

class ChecklistController {

    /** JSON helper */
    private function json(array $data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    private function csrf(): void {
        $tok = $_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF'] ?? null);
        Csrf::check($tok);
    }

    /** Mag de huidige gebruiker aan de takenlijst van deze activiteit? */
    private function canAccessActivity(string $activityId): bool {
        $a = Db::one('SELECT assignee_id, created_by FROM activities WHERE id = ?', [$activityId]);
        if (!$a) return false;
        return Auth::isStaff() || $a['assignee_id'] === Auth::id() || $a['created_by'] === Auth::id();
    }

    /** Scope uit de request halen: ['activity_id'=>x] of ['owner_id'=>me] */
    private function scope(): array {
        $activityId = $_POST['activity_id'] ?? $_GET['activity_id'] ?? '';
        if ($activityId !== '') {
            if (!$this->canAccessActivity($activityId)) { $this->json(['error' => 'Geen toegang'], 403); }
            return ['activity_id' => $activityId, 'owner_id' => null];
        }
        return ['activity_id' => null, 'owner_id' => Auth::id()];
    }

    private function items(array $scope): array {
        if ($scope['activity_id']) {
            return Db::all('SELECT * FROM checklist_items WHERE activity_id = ? ORDER BY position, created_at', [$scope['activity_id']]);
        }
        return Db::all('SELECT * FROM checklist_items WHERE owner_id = ? ORDER BY position, created_at', [$scope['owner_id']]);
    }

    private function nextPosition(array $scope): int {
        $row = $scope['activity_id']
            ? Db::one('SELECT COALESCE(MAX(position),-1)+1 AS p FROM checklist_items WHERE activity_id = ?', [$scope['activity_id']])
            : Db::one('SELECT COALESCE(MAX(position),-1)+1 AS p FROM checklist_items WHERE owner_id = ?', [$scope['owner_id']]);
        return (int)($row['p'] ?? 0);
    }

    /** Persoonlijke takenpagina */
    public function myTasks(): void {
        $items = $this->items(['activity_id' => null, 'owner_id' => Auth::id()]);
        $templates = Db::all('SELECT * FROM checklist_templates ORDER BY name');
        View::render('taken/index', ['title' => 'Mijn taken', 'items' => $items, 'templates' => $templates]);
    }

    /** Live polling endpoint */
    public function list(): void {
        $scope = $this->scope();
        $items = $this->items($scope);
        $done = 0;
        foreach ($items as $i) { if ((int)$i['done'] === 1) $done++; }
        $this->json(['items' => $items, 'total' => count($items), 'done' => $done]);
    }

    public function add(): void {
        $this->csrf();
        $scope = $this->scope();
        $title = trim($_POST['title'] ?? '');
        if ($title === '' || mb_strlen($title) > 255) { $this->json(['error' => 'Titel ongeldig'], 422); }
        Db::q('INSERT INTO checklist_items (id,activity_id,owner_id,title,position,created_by) VALUES (?,?,?,?,?,?)',
            [Db::uuid(), $scope['activity_id'], $scope['owner_id'], $title, $this->nextPosition($scope), Auth::id()]);
        $this->json(['ok' => true]);
    }

    public function toggle(array $p): void {
        $this->csrf();
        $item = Db::one('SELECT * FROM checklist_items WHERE id = ?', [$p['id']]);
        if (!$item) { $this->json(['error' => 'Niet gevonden'], 404); }
        if (!$this->mayEdit($item)) { $this->json(['error' => 'Geen toegang'], 403); }
        $done = (int)$item['done'] === 1 ? 0 : 1;
        Db::q('UPDATE checklist_items SET done=?, done_at=?, done_by=? WHERE id=?',
            [$done, $done ? date('Y-m-d H:i:s') : null, $done ? Auth::id() : null, $p['id']]);
        $this->json(['ok' => true, 'done' => $done]);
    }

    public function rename(array $p): void {
        $this->csrf();
        $item = Db::one('SELECT * FROM checklist_items WHERE id = ?', [$p['id']]);
        if (!$item) { $this->json(['error' => 'Niet gevonden'], 404); }
        if (!$this->mayEdit($item)) { $this->json(['error' => 'Geen toegang'], 403); }
        $title = trim($_POST['title'] ?? '');
        if ($title === '' || mb_strlen($title) > 255) { $this->json(['error' => 'Titel ongeldig'], 422); }
        Db::q('UPDATE checklist_items SET title=? WHERE id=?', [$title, $p['id']]);
        $this->json(['ok' => true]);
    }

    public function delete(array $p): void {
        $this->csrf();
        $item = Db::one('SELECT * FROM checklist_items WHERE id = ?', [$p['id']]);
        if (!$item) { $this->json(['error' => 'Niet gevonden'], 404); }
        if (!$this->mayEdit($item)) { $this->json(['error' => 'Geen toegang'], 403); }
        Db::q('DELETE FROM checklist_items WHERE id = ?', [$p['id']]);
        $this->json(['ok' => true]);
    }

    private function mayEdit(array $item): bool {
        if ($item['owner_id'] !== null) return $item['owner_id'] === Auth::id();
        return $this->canAccessActivity((string)$item['activity_id']);
    }

    /** Taken toevoegen uit een sjabloon */
    public function applyTemplate(): void {
        $this->csrf();
        $scope = $this->scope();
        $tplId = $_POST['template_id'] ?? '';
        $rows = Db::all('SELECT title FROM checklist_template_items WHERE template_id = ? ORDER BY position', [$tplId]);
        $this->insertTitles($scope, array_column($rows, 'title'));
    }

    /** Taken kopiëren van een eerdere activiteit */
    public function copyFrom(): void {
        $this->csrf();
        $scope = $this->scope();
        $from = $_POST['from_activity_id'] ?? '';
        if (!$this->canAccessActivity($from)) { $this->json(['error' => 'Geen toegang'], 403); }
        $rows = Db::all('SELECT title FROM checklist_items WHERE activity_id = ? ORDER BY position', [$from]);
        $this->insertTitles($scope, array_column($rows, 'title'));
    }

    private function insertTitles(array $scope, array $titles): void {
        $pos = $this->nextPosition($scope);
        foreach ($titles as $t) {
            Db::q('INSERT INTO checklist_items (id,activity_id,owner_id,title,position,created_by) VALUES (?,?,?,?,?,?)',
                [Db::uuid(), $scope['activity_id'], $scope['owner_id'], $t, $pos++, Auth::id()]);
        }
        $this->json(['ok' => true, 'added' => count($titles)]);
    }

    /** Huidige lijst bewaren als sjabloon (staff) */
    public function saveAsTemplate(): void {
        $this->csrf();
        if (!Auth::isStaff()) { $this->json(['error' => 'Geen toegang'], 403); }
        $scope = $this->scope();
        $name = trim($_POST['name'] ?? '');
        if ($name === '') { $this->json(['error' => 'Naam vereist'], 422); }
        $tplId = Db::uuid();
        Db::q('INSERT INTO checklist_templates (id,name,created_by) VALUES (?,?,?)', [$tplId, $name, Auth::id()]);
        $pos = 0;
        foreach ($this->items($scope) as $i) {
            Db::q('INSERT INTO checklist_template_items (id,template_id,title,position) VALUES (?,?,?,?)',
                [Db::uuid(), $tplId, $i['title'], $pos++]);
        }
        $this->json(['ok' => true, 'id' => $tplId]);
    }

    /** Beheer van checklist-sjablonen (staff) */
    public function templates(): void {
        $templates = Db::all('SELECT * FROM checklist_templates ORDER BY name');
        foreach ($templates as &$t) {
            $t['items'] = Db::all('SELECT * FROM checklist_template_items WHERE template_id = ? ORDER BY position', [$t['id']]);
        }
        View::render('taken/templates', ['title' => 'Checklist-sjablonen', 'templates' => $templates]);
    }

    public function storeTemplate(): void {
        Csrf::check($_POST['_csrf'] ?? null);
        $name = trim($_POST['name'] ?? '');
        $tasks = preg_split('/\r\n|\r|\n/', (string)($_POST['tasks'] ?? ''));
        $titles = array_values(array_filter(array_map('trim', $tasks), fn($t) => $t !== ''));
        if ($name === '' || !$titles) { header('Location: /checklist-templates?err=1'); exit; }
        $tplId = Db::uuid();
        Db::q('INSERT INTO checklist_templates (id,name,created_by) VALUES (?,?,?)', [$tplId, $name, Auth::id()]);
        $pos = 0;
        foreach ($titles as $t) {
            Db::q('INSERT INTO checklist_template_items (id,template_id,title,position) VALUES (?,?,?,?)',
                [Db::uuid(), $tplId, mb_substr($t, 0, 255), $pos++]);
        }
        header('Location: /checklist-templates'); exit;
    }

    public function deleteTemplate(array $p): void {
        Csrf::check($_POST['_csrf'] ?? null);
        Db::q('DELETE FROM checklist_templates WHERE id = ?', [$p['id']]);
        header('Location: /checklist-templates'); exit;
    }
}
