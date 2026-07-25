<?php
namespace App;

/**
 * Central helper voor het aanmaken van meldingen inclusief bezorgstatus per kanaal.
 */
class Notifier {
    public static function notify(string $userId, string $type, string $title, string $body,
                                  ?string $activityId = null, ?string $emailHtml = null, ?string $emailSubject = null): string {
        $notifId = Db::uuid();
        Db::q('INSERT INTO notifications (id,user_id,activity_id,type,title,body) VALUES (?,?,?,?,?,?)',
              [$notifId, $userId, $activityId, $type, $title, $body]);

        $u = Db::one('SELECT email,notif_email,notif_push,notif_inapp,full_name FROM users WHERE id = ?', [$userId]);
        if (!$u) return $notifId;

        // in-app
        if ((int)$u['notif_inapp'] === 1) {
            Db::q('INSERT INTO notification_deliveries (id,notification_id,channel,status,sent_at) VALUES (?,?,?,?,NOW())',
                  [Db::uuid(), $notifId, 'inapp', 'sent']);
        }

        // e-mail
        if ((int)$u['notif_email'] === 1) {
            $delId = Db::uuid();
            Db::q('INSERT INTO notification_deliveries (id,notification_id,channel,status) VALUES (?,?,?,?)',
                  [$delId, $notifId, 'email', 'queued']);
            $ok = Mailer::send($u['email'], $emailSubject ?? $title, $emailHtml ?? ('<p>'.htmlspecialchars($body).'</p>'));
            Db::q('UPDATE notification_deliveries SET status=?, sent_at=NOW() WHERE id=?',
                  [$ok ? 'sent' : 'failed', $delId]);
        }

        // push
        if ((int)$u['notif_push'] === 1) {
            $delId = Db::uuid();
            Db::q('INSERT INTO notification_deliveries (id,notification_id,channel,status) VALUES (?,?,?,?)',
                  [$delId, $notifId, 'push', 'queued']);
            $sent = Push::sendToUser($userId, [
                'title' => $title,
                'body'  => $body,
                'url'   => $activityId ? '/planning/'.$activityId : '/notifications',
            ]);
            Db::q('UPDATE notification_deliveries SET status=?, sent_at=NOW() WHERE id=?',
                  [$sent > 0 ? 'sent' : 'failed', $delId]);
        }

        return $notifId;
    }

    public static function markRead(string $userId, ?string $notifId = null): void {
        if ($notifId) {
            Db::q('UPDATE notifications SET read_at=NOW() WHERE id=? AND user_id=? AND read_at IS NULL',
                  [$notifId, $userId]);
            Db::q('UPDATE notification_deliveries d JOIN notifications n ON n.id=d.notification_id
                   SET d.read_at=NOW(), d.status=IF(d.status IN (\'sent\',\'delivered\'),\'read\',d.status)
                   WHERE n.id=? AND n.user_id=? AND d.read_at IS NULL',
                  [$notifId, $userId]);
        } else {
            Db::q('UPDATE notifications SET read_at=NOW() WHERE user_id=? AND read_at IS NULL', [$userId]);
            Db::q('UPDATE notification_deliveries d JOIN notifications n ON n.id=d.notification_id
                   SET d.read_at=NOW(), d.status=IF(d.status IN (\'sent\',\'delivered\'),\'read\',d.status)
                   WHERE n.user_id=? AND d.read_at IS NULL',
                  [$userId]);
        }
    }
}
