<?php
namespace App\Controllers;

use App\{Auth, Db, View, Config};

class DisplayController {

    private function json(array $data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    private static function code(): string {
        return rtrim(strtr(base64_encode(random_bytes(18)), '+/', '-_'), '=');
    }

    private function displayByCode(string $code): ?array {
        return Db::one('SELECT * FROM displays WHERE code = ? AND active = 1', [$code]);
    }

    /** Payload voor de TV: template, slides en (optioneel) planning van vandaag. */
    private function payload(array $display): array {
        $tpl = $display['template_id']
            ? Db::one('SELECT * FROM display_templates WHERE id = ?', [$display['template_id']])
            : null;
        $slides = $display['template_id']
            ? Db::all('SELECT * FROM display_slides WHERE template_id = ? AND active = 1 ORDER BY position, created_at', [$display['template_id']])
            : [];

        $theme = $tpl && $tpl['theme'] ? (json_decode((string)$tpl['theme'], true) ?: []) : [];
        $defaultSeconds = (int)($tpl['default_slide_seconds'] ?? 10);

        $out = [];
        $needsPlanning = false;
        foreach ($slides as $s) {
            $media = $s['media'] ? (json_decode((string)$s['media'], true) ?: []) : [];
            if ($s['kind'] === 'planning_today') $needsPlanning = true;
            $out[] = [
                'id'      => $s['id'],
                'kind'    => $s['kind'],
                'title'   => $s['title'],
                'body'    => $s['body'],
                'seconds' => ((int)$s['seconds'] > 0 ? (int)$s['seconds'] : ($defaultSeconds > 0 ? $defaultSeconds : 10)),
                'images'  => array_values(array_filter(array_map('strval', $media))),
            ];
        }

        $today = [];
        if ($needsPlanning) {
            $rows = Db::all(
                "SELECT a.start_at, a.end_at, a.title, a.location, u.full_name
                   FROM activities a
                   JOIN users u ON u.id = a.assignee_id
                  WHERE a.start_at >= ? AND a.start_at < ? AND a.status <> 'cancelled'
                  ORDER BY a.start_at",
                [date('Y-m-d 00:00:00'), date('Y-m-d 00:00:00', strtotime('+1 day'))]
            );
            foreach ($rows as $r) {
                $first = preg_split('/\s+/', trim((string)$r['full_name']))[0] ?? '';
                $today[] = [
                    'start'    => $r['start_at'],
                    'end'      => $r['end_at'],
                    'title'    => $r['title'],
                    'location' => $r['location'],
                    'person'   => $first !== '' ? $first : null,
                ];
            }
        }

        return [
            'name'           => $display['name'],
            'timezone'       => $display['timezone'] ?: 'Europe/Brussels',
            'show_clock'     => (int)($tpl['show_clock'] ?? 1) === 1,
            'clock_position' => $tpl['clock_position'] ?? 'top-right',
            'theme'          => $theme,
            'slides'         => $out,
            'today'          => $today,
        ];
    }

    /** Publieke fullscreen TV-pagina (geen login, alleen de geheime code). */
    public function show(array $p): void {
        $display = $this->displayByCode($p['code'] ?? '');
        if (!$display) {
            http_response_code(404);
            $data = null;
        } else {
            $data = $this->payload($display);
        }
        header('Content-Type: text/html; charset=utf-8');
        $code = (string)($p['code'] ?? '');
        include __DIR__ . '/../Views/display/screen.php';
    }

    /** Publieke JSON voor polling. */
    public function data(array $p): void {
        $display = $this->displayByCode($p['code'] ?? '');
        if (!$display) $this->json(['error' => 'Niet gevonden'], 404);
        $this->json($this->payload($display));
    }

    // ============ Beheer (management/admin) ============

    public function admin(): void {
        $displays  = Db::all('SELECT * FROM displays ORDER BY name');
        $templates = Db::all('SELECT * FROM display_templates ORDER BY name');
        $templateId = $_GET['template'] ?? ($templates[0]['id'] ?? null);
        $slides = $templateId
            ? Db::all('SELECT * FROM display_slides WHERE template_id = ? ORDER BY position, created_at', [$templateId])
            : [];
        View::render('display/admin', [
            'title'      => 'Infoscherm',
            'displays'   => $displays,
            'templates'  => $templates,
            'templateId' => $templateId,
            'slides'     => $slides,
        ]);
    }

    public function saveDisplay(): void {
        $id   = $_POST['id'] ?? '';
        $name = trim($_POST['name'] ?? '');
        $tpl  = ($_POST['template_id'] ?? '') ?: null;
        $tz   = trim($_POST['timezone'] ?? '') ?: 'Europe/Brussels';
        $act  = isset($_POST['active']) ? 1 : 0;
        if ($name === '') { $this->back('Naam is verplicht'); }
        if ($id) {
            Db::q('UPDATE displays SET name=?, template_id=?, timezone=?, active=? WHERE id=?', [$name, $tpl, $tz, $act, $id]);
        } else {
            Db::q('INSERT INTO displays (id,name,code,template_id,active,timezone) VALUES (?,?,?,?,?,?)',
                [Db::uuid(), $name, self::code(), $tpl, 1, $tz]);
        }
        $this->back();
    }

    public function regenCode(array $p): void {
        Db::q('UPDATE displays SET code=? WHERE id=?', [self::code(), $p['id']]);
        $this->back();
    }

    public function deleteDisplay(array $p): void {
        Db::q('DELETE FROM displays WHERE id=?', [$p['id']]);
        $this->back();
    }

    public function saveTemplate(): void {
        $id   = $_POST['id'] ?? '';
        $name = trim($_POST['name'] ?? '');
        if ($name === '') { $this->back('Naam is verplicht'); }
        $theme = json_encode([
            'bg'        => trim($_POST['bg'] ?? '#0b1220'),
            'text'      => trim($_POST['text'] ?? '#ffffff'),
            'overlay'   => (float)($_POST['overlay'] ?? 0.35),
            'textScale' => (float)($_POST['textScale'] ?? 1),
        ]);
        $clock = isset($_POST['show_clock']) ? 1 : 0;
        $pos   = in_array($_POST['clock_position'] ?? '', ['top-left','top-right','bottom-left','bottom-right'], true)
            ? $_POST['clock_position'] : 'top-right';
        $secs  = max(3, (int)($_POST['default_slide_seconds'] ?? 10));
        if ($id) {
            Db::q('UPDATE display_templates SET name=?, theme=?, show_clock=?, clock_position=?, default_slide_seconds=? WHERE id=?',
                [$name, $theme, $clock, $pos, $secs, $id]);
        } else {
            $id = Db::uuid();
            Db::q('INSERT INTO display_templates (id,name,theme,show_clock,clock_position,default_slide_seconds,created_by) VALUES (?,?,?,?,?,?,?)',
                [$id, $name, $theme, $clock, $pos, $secs, Auth::id()]);
        }
        $this->back(null, '/display-admin?template=' . urlencode($id));
    }

    public function deleteTemplate(array $p): void {
        Db::q('DELETE FROM display_templates WHERE id=?', [$p['id']]);
        $this->back();
    }

    public function saveSlide(): void {
        $templateId = $_POST['template_id'] ?? '';
        if ($templateId === '') { $this->back('Kies eerst een template'); }
        $id    = $_POST['id'] ?? '';
        $kind  = in_array($_POST['kind'] ?? '', ['text','photos','planning_today'], true) ? $_POST['kind'] : 'text';
        $title = trim($_POST['title'] ?? '');
        $body  = trim($_POST['body'] ?? '');
        $secs  = (int)($_POST['seconds'] ?? 0);
        $act   = isset($_POST['active']) ? 1 : 0;

        $media = [];
        if ($id) {
            $cur = Db::one('SELECT media FROM display_slides WHERE id=?', [$id]);
            $media = $cur && $cur['media'] ? (json_decode((string)$cur['media'], true) ?: []) : [];
        }
        if (!empty($_POST['remove_media'])) {
            $media = array_values(array_diff($media, (array)$_POST['remove_media']));
        }
        foreach ($this->uploadFiles() as $url) { $media[] = $url; }

        if ($id) {
            Db::q('UPDATE display_slides SET kind=?, title=?, body=?, media=?, seconds=?, active=? WHERE id=?',
                [$kind, $title ?: null, $body ?: null, json_encode($media), $secs ?: null, $act, $id]);
        } else {
            $row = Db::one('SELECT COALESCE(MAX(position),-1)+1 AS p FROM display_slides WHERE template_id=?', [$templateId]);
            Db::q('INSERT INTO display_slides (id,template_id,kind,position,title,body,media,seconds,active) VALUES (?,?,?,?,?,?,?,?,?)',
                [Db::uuid(), $templateId, $kind, (int)($row['p'] ?? 0), $title ?: null, $body ?: null, json_encode($media), $secs ?: null, 1]);
        }
        $this->back(null, '/display-admin?template=' . urlencode($templateId));
    }

    public function deleteSlide(array $p): void {
        $s = Db::one('SELECT template_id FROM display_slides WHERE id=?', [$p['id']]);
        Db::q('DELETE FROM display_slides WHERE id=?', [$p['id']]);
        $this->back(null, '/display-admin?template=' . urlencode((string)($s['template_id'] ?? '')));
    }

    public function moveSlide(array $p): void {
        $s = Db::one('SELECT * FROM display_slides WHERE id=?', [$p['id']]);
        if (!$s) { $this->back('Slide niet gevonden'); }
        $dir = ($_POST['dir'] ?? 'up') === 'down' ? 'down' : 'up';
        $rows = Db::all('SELECT id FROM display_slides WHERE template_id=? ORDER BY position, created_at', [$s['template_id']]);
        $ids = array_column($rows, 'id');
        $i = array_search($s['id'], $ids, true);
        $j = $dir === 'up' ? $i - 1 : $i + 1;
        if ($i !== false && $j >= 0 && $j < count($ids)) {
            [$ids[$i], $ids[$j]] = [$ids[$j], $ids[$i]];
            foreach ($ids as $pos => $sid) {
                Db::q('UPDATE display_slides SET position=? WHERE id=?', [$pos, $sid]);
            }
        }
        $this->back(null, '/display-admin?template=' . urlencode((string)$s['template_id']));
    }

    /** Uploads naar public/uploads/display/, alleen afbeeldingen. */
    private function uploadFiles(): array {
        $out = [];
        if (empty($_FILES['media']) || !is_array($_FILES['media']['name'])) return $out;
        $dir = __DIR__ . '/../../public/uploads/display';
        if (!is_dir($dir)) @mkdir($dir, 0755, true);
        $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
        $count = count($_FILES['media']['name']);
        for ($i = 0; $i < $count; $i++) {
            if ((int)$_FILES['media']['error'][$i] !== UPLOAD_ERR_OK) continue;
            $tmp = $_FILES['media']['tmp_name'][$i];
            if ((int)$_FILES['media']['size'][$i] > 8 * 1024 * 1024) continue;
            $mime = (string)(new \finfo(FILEINFO_MIME_TYPE))->file($tmp);
            if (!isset($allowed[$mime])) continue;
            $name = bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
            if (move_uploaded_file($tmp, $dir . '/' . $name)) {
                $out[] = '/uploads/display/' . $name;
            }
        }
        return $out;
    }

    private function back(?string $error = null, ?string $to = null): void {
        if ($error) $_SESSION['flash_error'] = $error;
        header('Location: ' . ($to ?: ($_SERVER['HTTP_REFERER'] ?? '/display-admin')));
        exit;
    }
}
