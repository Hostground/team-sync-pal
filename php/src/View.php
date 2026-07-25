<?php
namespace App;

class View {
    public static function render(string $tpl, array $data = []): void {
        extract($data, EXTR_SKIP);
        $__tpl = $tpl;
        $viewFile = __DIR__ . '/Views/' . $__tpl . '.php';
        if (!is_file($viewFile)) { http_response_code(500); echo "View niet gevonden: $__tpl"; return; }
        ob_start();
        include $viewFile;
        $content = ob_get_clean();
        include __DIR__ . '/Views/layout.php';
    }
    public static function e(?string $s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
    public static function fmtDate(?string $iso, string $fmt = 'd/m/Y H:i'): string {
        if (!$iso) return '';
        try { return (new \DateTime($iso))->format($fmt); } catch (\Throwable) { return $iso; }
    }
}
