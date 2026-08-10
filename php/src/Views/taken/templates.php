<?php use App\{View, Csrf}; ?>
<h1>Checklist-sjablonen</h1>

<form method="post" action="/checklist-templates" class="card form">
  <?= Csrf::field() ?>
  <label>Naam *<input type="text" name="name" required maxlength="150"></label>
  <label>Taken (één per lijn) *<textarea name="tasks" rows="6" required placeholder="Materiaal laden
Werf opruimen
Foto's nemen"></textarea></label>
  <button class="btn primary">Aanmaken</button>
</form>

<ul class="list">
<?php foreach ($templates as $t): ?>
  <li class="card">
    <div class="row">
      <strong><?= View::e($t['name']) ?></strong>
      <form method="post" action="/checklist-templates/<?= $t['id'] ?>/delete" onsubmit="return confirm('Verwijderen?')">
        <?= Csrf::field() ?>
        <button class="linkbtn danger">Verwijderen</button>
      </form>
    </div>
    <div class="meta"><?= View::e(implode(' · ', array_column($t['items'], 'title'))) ?></div>
  </li>
<?php endforeach; ?>
<?php if (!$templates): ?><li class="empty">Nog geen checklist-sjablonen.</li><?php endif; ?>
</ul>
