<?php
// Auto-escalatie: verlopen 'pending' activiteiten → 'auto_declined' + audit + notificaties.
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\{Config, Db, Notifier, Audit};

$config = require __DIR__ . '/../config/config.php';
Config::set($config);
date_default_timezone_set($config['app']['timezone'] ?? 'Europe/Brussels');
Db::init($config['db']);

$overdue = Db::all("SELECT * FROM activities WHERE status='pending' AND respond_by < NOW()");
if (!$overdue) { echo "Niets te escaleren.\n"; exit(0); }

$staff = Db::all("SELECT DISTINCT user_id FROM user_roles WHERE role IN ('admin','management')");

foreach ($overdue as $a) {
    Db::q("UPDATE activities SET status='auto_declined' WHERE id=?", [$a['id']]);
    Audit::log($a['id'], null, 'auto_declined', 'pending', 'auto_declined', 'Automatisch geweigerd: bevestigingstermijn verlopen');
    foreach ($staff as $s) {
        Notifier::notify($s['user_id'], 'activity_auto_declined',
            'Activiteit automatisch geweigerd',
            $a['title'].' — bevestigingstermijn verlopen op '.$a['respond_by'],
            $a['id']);
    }
}
echo "Geëscaleerd: " . count($overdue) . "\n";
