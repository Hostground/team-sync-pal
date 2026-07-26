<?php
namespace App;



use PHPMailer\PHPMailer\PHPMailer;

class Mailer {
    public static function config(): array {
        $c = Config::get('smtp') ?: [];
        try {
            $rows = Db::all("SELECT `key`,`value` FROM settings WHERE `key` LIKE 'smtp.%'");
            foreach ($rows as $r) {
                $k = substr($r['key'], 5);
                if ($r['value'] !== '' && $r['value'] !== null) $c[$k] = $r['value'];
            }
        } catch (\Throwable $e) { /* settings table may not exist yet */ }
        return $c;
    }

    public static function send(string $to, string $subject, string $htmlBody, string $textBody = ''): bool {
        $c = self::config();
        if (empty($c['host']) || empty($c['from'])) { error_log('[Mailer] SMTP niet geconfigureerd'); return false; }
        $m = new PHPMailer(true);
        try {
            $m->isSMTP();
            $m->Host = $c['host'];
            $m->Port = (int)$c['port'];
            $m->SMTPAuth = true;
            $m->Username = $c['username'];
            $m->Password = $c['password'];
            if (!empty($c['secure'])) $m->SMTPSecure = $c['secure'];
            $m->CharSet = 'UTF-8';
            $m->setFrom($c['from'], $c['fromName'] ?? $c['from']);
            $m->addAddress($to);
            $m->Subject = $subject;
            $m->isHTML(true);
            $m->Body = $htmlBody;
            $m->AltBody = $textBody ?: strip_tags($htmlBody);
            return $m->send();
        } catch (\Throwable $e) {
            error_log('[Mailer] '.$e->getMessage());
            return false;
        }
    }
}
