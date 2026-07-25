<?php
namespace App;

class Audit {
    public static function log(string $activityId, ?string $actorId, string $action,
                               ?string $prev = null, ?string $new = null, ?string $note = null): void {
        Db::q(
            'INSERT INTO activity_audit_log (id,activity_id,actor_id,action,previous_status,new_status,note)
             VALUES (?,?,?,?,?,?,?)',
            [Db::uuid(), $activityId, $actorId, $action, $prev, $new, $note]
        );
    }
}
