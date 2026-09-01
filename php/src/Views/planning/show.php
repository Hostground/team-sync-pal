<?php use App\{Auth, Csrf, View}; $overdue = $a['status']==='pending' && strtotime($a['respond_by'])<time(); ?>
<h1><?= View::e($a['title']) ?> <span class="badge status-<?= $a['status'] ?>"><?= $a['status'] ?></span>
<?php if (!empty($a['is_rolling'])): ?><span class="badge">Lopend</span><?php endif; ?></h1>
<div class="card">
  <p><strong>Wanneer:</strong> <?= View::fmtDate($a['start_at']) ?> — <?= View::fmtDate($a['end_at']) ?></p>
  <p><strong>Medewerker:</strong> <?= View::e($a['assignee_name']) ?></p>
  <?php if ($a['type_name']): ?><p><strong>Type:</strong> <?= View::e($a['type_name']) ?></p><?php endif; ?>
  <?php if ($a['location']): ?><p><strong>Locatie:</strong> <?= View::e($a['location']) ?></p><?php endif; ?>
  <?php if ($a['customer']): ?><p><strong>Klant:</strong> <?= View::e($a['customer']) ?></p><?php endif; ?>
  <?php if ($a['description']): ?><p><?= nl2br(View::e($a['description'])) ?></p><?php endif; ?>
  <?php if ($a['status']==='pending'): ?>
    <p class="<?= $overdue?'overdue':'muted' ?>"><?= $overdue?'Verlopen':'Reageren voor' ?> <?= View::fmtDate($a['respond_by']) ?></p>
  <?php endif; ?>
  <?php if ($a['response_note']): ?><p><strong>Nota:</strong> <?= View::e($a['response_note']) ?></p><?php endif; ?>
</div>

<?php if ($a['status']==='pending' && $a['assignee_id']===Auth::id()): ?>
<form method="post" action="/planning/<?= $a['id'] ?>/respond" class="card form">
  <?= Csrf::field() ?>
  <label>Nota (optioneel)<textarea name="note" rows="2"></textarea></label>
  <div>
    <button class="btn primary" name="decision" value="confirmed">Bevestigen</button>
    <button class="btn danger" name="decision" value="declined">Weigeren</button>
  </div>
</form>
<?php endif; ?>

<?php
  $checklistScope = ['activity_id' => $a['id']];
  $checklistTemplates = $checklistTemplates ?? [];
  include __DIR__ . '/../partials/checklist.php';
?>

<h2>Geschiedenis</h2>
<ul class="list">
<?php foreach ($audit as $l): ?>
  <li class="card">
    <div><strong><?= View::e($l['action']) ?></strong> · <?= View::fmtDate($l['created_at']) ?></div>
    <div class="meta"><?= View::e($l['actor_name'] ?? 'Systeem') ?><?php if ($l['note']): ?> — <?= View::e($l['note']) ?><?php endif; ?></div>
  </li>
<?php endforeach; ?>
<?php if (!$audit): ?><li class="empty">Geen geschiedenis.</li><?php endif; ?>
</ul>

<?php if (Auth::isStaff() && $deliveries): ?>
<h2>Meldingsstatus</h2>
<ul class="list">
<?php foreach ($deliveries as $d): ?>
  <li class="card">
    <?= View::e($d['user_name'] ?? '') ?> · <?= View::e($d['channel']) ?> · <span class="badge"><?= View::e($d['status']) ?></span>
    <?php if ($d['read_at']): ?>· gelezen <?= View::fmtDate($d['read_at']) ?><?php endif; ?>
  </li>
<?php endforeach; ?>
</ul>
<?php endif; ?>
