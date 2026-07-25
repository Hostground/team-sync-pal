<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Router;
use App\Config;
use App\Auth;
use App\Db;

$config = require __DIR__ . '/../config/config.php';
Config::set($config);
date_default_timezone_set($config['app']['timezone'] ?? 'Europe/Brussels');

// Sessie
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => !empty($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

Db::init($config['db']);
Auth::boot();

$router = new Router();

// Public
$router->get('/',              [\App\Controllers\AuthController::class, 'root']);
$router->get('/login',         [\App\Controllers\AuthController::class, 'showLogin']);
$router->post('/login',        [\App\Controllers\AuthController::class, 'login']);
$router->get('/register',      [\App\Controllers\AuthController::class, 'showRegister']);
$router->post('/register',     [\App\Controllers\AuthController::class, 'register']);
$router->post('/logout',       [\App\Controllers\AuthController::class, 'logout']);
$router->get('/respond',       [\App\Controllers\ApiController::class, 'respondForm']);
$router->post('/respond',      [\App\Controllers\ApiController::class, 'respondSubmit']);

// WebAuthn (public endpoints; user resolveerd via challenge/email)
$router->post('/webauthn/register/options', [\App\Controllers\AuthController::class, 'webauthnRegisterOptions']);
$router->post('/webauthn/register/verify',  [\App\Controllers\AuthController::class, 'webauthnRegisterVerify']);
$router->post('/webauthn/login/options',    [\App\Controllers\AuthController::class, 'webauthnLoginOptions']);
$router->post('/webauthn/login/verify',     [\App\Controllers\AuthController::class, 'webauthnLoginVerify']);

// Auth-only
$router->get('/planning',       [\App\Controllers\PlanningController::class, 'index'],  'auth');
$router->get('/planning/new',   [\App\Controllers\PlanningController::class, 'create'], 'staff');
$router->post('/planning/new',  [\App\Controllers\PlanningController::class, 'store'],  'staff');
$router->get('/planning/{id}',  [\App\Controllers\PlanningController::class, 'show'],   'auth');
$router->post('/planning/{id}/respond', [\App\Controllers\PlanningController::class, 'respond'], 'auth');

$router->get('/notifications',      [\App\Controllers\NotificationController::class, 'index'],   'auth');
$router->post('/notifications/read',[\App\Controllers\NotificationController::class, 'markRead'], 'auth');
$router->post('/push/subscribe',    [\App\Controllers\NotificationController::class, 'subscribe'],'auth');

$router->get('/templates',         [\App\Controllers\TemplateController::class, 'index'], 'staff');
$router->post('/templates',        [\App\Controllers\TemplateController::class, 'store'], 'staff');
$router->post('/templates/{id}/delete', [\App\Controllers\TemplateController::class, 'delete'], 'staff');

$router->get('/overzicht',         [\App\Controllers\OverviewController::class, 'index'], 'staff');

$router->get('/settings',          [\App\Controllers\SettingsController::class, 'index'], 'auth');
$router->post('/settings',         [\App\Controllers\SettingsController::class, 'save'],  'auth');

$router->get('/admin/users',       [\App\Controllers\AdminController::class, 'users'], 'admin');
$router->post('/admin/users/{id}/role', [\App\Controllers\AdminController::class, 'setRole'], 'admin');
$router->get('/admin/types',       [\App\Controllers\AdminController::class, 'types'], 'admin');
$router->post('/admin/types',      [\App\Controllers\AdminController::class, 'saveType'], 'admin');
$router->post('/admin/types/{id}/delete', [\App\Controllers\AdminController::class, 'deleteType'], 'admin');

$router->dispatch();
