<?php use App\{Csrf, View}; ?>
<h1>Activiteitstypes</h1>
<form method="post" action="/admin/types" class="form card">
  <?= Csrf::field() ?>
  <label>Naam<input name="name" required></label>
  <label>Kleur<input name="color" placeholder="#3b82f6"></label>
  <button class="btn primary">Toevoegen</button>
</form>
<ul class="list">
<?php foreach ($rows as $t): ?>
  <li class="card row">
    <form method="post" action="/admin/types" class="row" style="gap:.5rem">
      <?= Csrf::field() ?>
      <input type="hidden" name="id" value="<?= $t['id'] ?>">
      <input name="name" value="<?= View::e($t['name']) ?>" required>
      <input name="color" value="<?= View::e($t['color']) ?>">
      <label><input type="checkbox" name="active" <?= $t['active']?'checked':'' ?>> Actief</label>
      <button class="btn ghost">Opslaan</button>
    </form>
    <form method="post" action="/admin/types/<?= $t['id'] ?>/delete"><?= Csrf::field() ?><button class="linkbtn">Verwijderen</button></form>
  </li>
<?php endforeach; ?>
</ul>
