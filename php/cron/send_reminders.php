<?php
// Herinneringen X uur voor respond_by (X uit settings.reminder_hours_before).
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';
use App\{Config, Db, Notifier};

$config = require __DIR__ . '/../config/config.php';
Config::set($config);
date_default_timezone_set($config['app']['timezone'] ?? 'Europe/Brussels');
Db::init($config['db']);

$hours = (int)(Db::one("SELECT `value` FROM settings WHERE `key`='reminder_hours_before'")['value'] ?? 2);
$rows = Db::all(
    "SELECT * FROM activities
     WHERE status='pending' AND reminder_sent_at IS NULL
       AND respond_by BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? HOUR)", [$hours]);
foreach ($rows as $a) {
    Notifier::notify($a['assignee_id'], 'activity_reminder',
        'Herinnering: ' . $a['title'],
        'Reageren voor ' . $a['respond_by'], $a['id']);
    Db::q('UPDATE activities SET reminder_sent_at=NOW() WHERE id=?', [$a['id']]);
}
echo "Herinneringen: " . count($rows) . "\n";
