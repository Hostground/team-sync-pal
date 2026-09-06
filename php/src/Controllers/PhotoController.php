<?php
namespace App\Controllers;

use App\{Auth, Db, Csrf};

class PhotoController {

    private const MAX_BYTES = 15 * 1024 * 1024; // 15 MB per foto

    private function json(array $data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    private function activity(string $id): array {
        $a = Db::one('SELECT id, assignee_id, created_by FROM activities WHERE id = ?', [$id]);
        if (!$a) { $this->json(['error' => 'Niet gevonden'], 404); }
        if (!Auth::isStaff() && $a['assignee_id'] !== Auth::id() && $a['created_by'] !== Auth::id()) {
            $this->json(['error' => 'Geen toegang'], 403);
        }
        return $a;
    }

    private function uploadDir(string $activityId): string {
        $dir = dirname(__DIR__, 2) . '/public/uploads/activities/' . $activityId;
        if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
        return $dir;
    }

    /** GET /planning/{id}/photos — lijst als JSON */
    public function index(array $p): void {
        $this->activity($p['id']);
        $rows = Db::all(
            'SELECT ph.*, u.full_name AS uploader_name
             FROM activity_photos ph LEFT JOIN users u ON u.id = ph.uploaded_by
             WHERE ph.activity_id = ? ORDER BY ph.created_at DESC', [$p['id']]);
        $this->json(['photos' => $rows]);
    }

    /** POST /planning/{id}/photos — één of meerdere foto's opladen */
    public function store(array $p): void {
        Csrf::check($_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF'] ?? null));
        $this->activity($p['id']);

        if (empty($_FILES['photos'])) { $this->json(['error' => 'Geen bestand ontvangen'], 400); }

        $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        $dir = $this->uploadDir($p['id']);
        $files = $_FILES['photos'];
        $count = is_array($files['tmp_name']) ? count($files['tmp_name']) : 1;
        $saved = 0; $errors = [];

        $lat = ($_POST['lat'] ?? '') !== '' ? (float)$_POST['lat'] : null;
        $lng = ($_POST['lng'] ?? '') !== '' ? (float)$_POST['lng'] : null;
        $caption = trim((string)($_POST['caption'] ?? '')) ?: null;

        for ($i = 0; $i < $count; $i++) {
            $tmp  = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
            $err  = is_array($files['error'])    ? $files['error'][$i]    : $files['error'];
            $size = is_array($files['size'])     ? $files['size'][$i]     : $files['size'];
            if ($err !== UPLOAD_ERR_OK || !is_uploaded_file($tmp)) { $errors[] = 'Upload mislukt'; continue; }
            if ($size > self::MAX_BYTES) { $errors[] = 'Bestand te groot (max 15 MB)'; continue; }

            $info = @getimagesize($tmp);
            $mime = $info['mime'] ?? '';
            if (!isset($allowed[$mime])) { $errors[] = 'Alleen JPG, PNG of WEBP'; continue; }

            $id = Db::uuid();
            $name = $id . '.' . $allowed[$mime];
            if (!@move_uploaded_file($tmp, $dir . '/' . $name)) { $errors[] = 'Opslaan mislukt'; continue; }

            Db::q('INSERT INTO activity_photos (id,activity_id,path,caption,lat,lng,taken_at,uploaded_by)
                   VALUES (?,?,?,?,?,?,NOW(),?)',
                  [$id, $p['id'], 'uploads/activities/' . $p['id'] . '/' . $name, $caption, $lat, $lng, Auth::id()]);
            $saved++;
        }

        $this->json(['ok' => $saved > 0, 'saved' => $saved, 'errors' => $errors], $saved > 0 ? 200 : 400);
    }

    /** POST /photos/{id}/delete — eigen foto of staff */
    public function delete(array $p): void {
        Csrf::check($_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF'] ?? null));
        $ph = Db::one('SELECT * FROM activity_photos WHERE id = ?', [$p['id']]);
        if (!$ph) { $this->json(['error' => 'Niet gevonden'], 404); }
        if (!Auth::isStaff() && $ph['uploaded_by'] !== Auth::id()) { $this->json(['error' => 'Geen toegang'], 403); }

        $abs = dirname(__DIR__, 2) . '/public/' . $ph['path'];
        if (is_file($abs)) { @unlink($abs); }
        Db::q('DELETE FROM activity_photos WHERE id = ?', [$p['id']]);
        $this->json(['ok' => true]);
    }

    /** POST /planning/{id}/location — pin op de kaart bewaren */
    public function saveLocation(array $p): void {
        Csrf::check($_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF'] ?? null));
        $this->activity($p['id']);
        $lat = ($_POST['lat'] ?? '') !== '' ? (float)$_POST['lat'] : null;
        $lng = ($_POST['lng'] ?? '') !== '' ? (float)$_POST['lng'] : null;
        if ($lat !== null && ($lat < -90 || $lat > 90)) { $this->json(['error' => 'Ongeldige coördinaat'], 400); }
        if ($lng !== null && ($lng < -180 || $lng > 180)) { $this->json(['error' => 'Ongeldige coördinaat'], 400); }
        Db::q('UPDATE activities SET lat = ?, lng = ? WHERE id = ?', [$lat, $lng, $p['id']]);
        $this->json(['ok' => true, 'lat' => $lat, 'lng' => $lng]);
    }
}
