<?php
// Auto-escalatie: verlopen 'pending' activiteiten → 'auto_declined' + audit + notificaties.
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\{Config, Db, Notifier, Audit};

$config = require __DIR__ . '/../config/config.php';
Config::set($config);
date_default_timezone_set($config['app']['timezone'] ?? 'Europe/Brussels');
Db::init($config['db']);

// 1) Lopende activiteiten die niet afgerond zijn → +1 dag doorschuiven.
$rolling = Db::all(
    "SELECT * FROM activities
     WHERE is_rolling = 1
       AND status NOT IN ('completed','cancelled','declined','auto_declined')
       AND end_at < NOW()"
);
foreach ($rolling as $a) {
    $newStart = (new \DateTime($a['start_at']))->modify('+1 day')->format('Y-m-d H:i:s');
    $newEnd   = (new \DateTime($a['end_at']))->modify('+1 day')->format('Y-m-d H:i:s');
    $sql = 'UPDATE activities SET start_at=?, end_at=?, rollover_count=rollover_count+1';
    $args = [$newStart, $newEnd];
    if ($a['status'] === 'pending') { $sql .= ', respond_by=?'; $args[] = $newEnd; }
    $sql .= ' WHERE id=?'; $args[] = $a['id'];
    Db::q($sql, $args);
    Audit::log($a['id'], null, 'rolled_over', $a['status'], $a['status'],
        'Doorgeschoven van '.$a['start_at'].' naar '.$newStart);
}

// 2) Verlopen niet-lopende 'pending' activiteiten → auto_declined.
$overdue = Db::all("SELECT * FROM activities WHERE status='pending' AND is_rolling = 0 AND respond_by < NOW()");
if (!$overdue) { echo "Doorgeschoven: ".count($rolling).". Niets te escaleren.\n"; exit(0); }

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
echo "Doorgeschoven: ".count($rolling).". Geëscaleerd: " . count($overdue) . "\n";
