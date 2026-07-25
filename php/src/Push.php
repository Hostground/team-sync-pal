<?php
namespace App;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class Push {
    public static function sendToUser(string $userId, array $payload): int {
        $v = Config::get('vapid');
        if (empty($v['publicKey']) || empty($v['privateKey'])) return 0;
        $subs = Db::all('SELECT * FROM push_subscriptions WHERE user_id = ?', [$userId]);
        if (!$subs) return 0;
        $wp = new WebPush([
            'VAPID' => [
                'subject'    => $v['subject'],
                'publicKey'  => $v['publicKey'],
                'privateKey' => $v['privateKey'],
            ],
        ]);
        $count = 0;
        foreach ($subs as $s) {
            $sub = Subscription::create([
                'endpoint' => $s['endpoint'],
                'publicKey' => $s['p256dh'],
                'authToken' => $s['auth'],
            ]);
            $wp->queueNotification($sub, json_encode($payload, JSON_UNESCAPED_UNICODE));
            $count++;
        }
        foreach ($wp->flush() as $report) {
            if (!$report->isSuccess()) {
                // Verwijder verlopen subscription
                $ep = $report->getRequest()->getUri()->__toString();
                Db::q('DELETE FROM push_subscriptions WHERE endpoint = ?', [$ep]);
            }
        }
        return $count;
    }
}
