<?php
namespace App;

use PHPMailer\PHPMailer\PHPMailer;

class Mailer {
    public static function send(string $to, string $subject, string $htmlBody, string $textBody = ''): bool {
        $c = Config::get('smtp');
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
