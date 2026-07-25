<?php use App\{Csrf, View}; ?>
<h1>Meldingen</h1>
<form method="post" action="/notifications/read"><?= Csrf::field() ?><button class="btn ghost">Alles als gelezen markeren</button></form>
<ul class="list">
<?php foreach ($rows as $n): ?>
  <li class="card <?= $n['read_at']?'read':'unread' ?>">
    <div><strong><?= View::e($n['title']) ?></strong> · <?= View::fmtDate($n['created_at']) ?></div>
    <div><?= View::e($n['body']) ?></div>
    <?php if ($n['activity_id']): ?><a href="/planning/<?= $n['activity_id'] ?>">Bekijk activiteit</a><?php endif; ?>
  </li>
<?php endforeach; ?>
<?php if (!$rows): ?><li class="empty">Geen meldingen.</li><?php endif; ?>
</ul>
