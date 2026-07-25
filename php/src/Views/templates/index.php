<?php use App\{Csrf, View}; ?>
<h1>Sjablonen</h1>
<form method="post" action="/templates" class="form card">
  <?= Csrf::field() ?>
  <label>Naam<input name="name" required></label>
  <label>Titel<input name="title" required></label>
  <label>Type
    <select name="type_id"><option value="">—</option>
    <?php foreach ($types as $t): ?><option value="<?= $t['id'] ?>"><?= View::e($t['name']) ?></option><?php endforeach; ?>
    </select>
  </label>
  <label>Locatie<input name="location"></label>
  <label>Duur (minuten)<input type="number" name="duration_minutes"></label>
  <label>Omschrijving<textarea name="description" rows="2"></textarea></label>
  <button class="btn primary">Opslaan</button>
</form>
<ul class="list">
<?php foreach ($rows as $t): ?>
  <li class="card">
    <div><strong><?= View::e($t['name']) ?></strong> — <?= View::e($t['title']) ?></div>
    <form method="post" action="/templates/<?= $t['id'] ?>/delete"><?= Csrf::field() ?><button class="linkbtn">Verwijderen</button></form>
  </li>
<?php endforeach; ?>
</ul>
