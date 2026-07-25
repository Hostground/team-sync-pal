<?php
namespace App;

class Router {
    private array $routes = [];

    public function get(string $path, array $handler, ?string $guard = null): void  { $this->add('GET', $path, $handler, $guard); }
    public function post(string $path, array $handler, ?string $guard = null): void { $this->add('POST', $path, $handler, $guard); }

    private function add(string $m, string $path, array $handler, ?string $guard): void {
        $regex = preg_replace('#\{([^/]+)\}#', '(?P<$1>[^/]+)', $path);
        $this->routes[] = [$m, "#^{$regex}$#", $handler, $guard];
    }

    public function dispatch(): void {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
        foreach ($this->routes as [$m, $rx, $h, $guard]) {
            if ($m !== $method) continue;
            if (preg_match($rx, $uri, $mm)) {
                if ($guard) $this->guard($guard);
                $params = array_filter($mm, 'is_string', ARRAY_FILTER_USE_KEY);
                if ($method === 'POST') Csrf::check($_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF'] ?? null));
                [$class, $fn] = $h;
                (new $class)->$fn($params);
                return;
            }
        }
        http_response_code(404);
        View::render('errors/404', ['title' => 'Niet gevonden']);
    }

    private function guard(string $guard): void {
        $u = Auth::user();
        if (!$u) { header('Location: /login'); exit; }
        if ($guard === 'auth') return;
        $roles = Auth::roles();
        if ($guard === 'staff' && !array_intersect($roles, ['admin','management'])) $this->forbid();
        if ($guard === 'admin' && !in_array('admin', $roles, true)) $this->forbid();
    }
    private function forbid(): void {
        http_response_code(403);
        View::render('errors/403', ['title' => 'Geen toegang']);
        exit;
    }
}
