<?php use App\{Csrf, View}; ?>
<h1>Gebruikers</h1>
<ul class="list">
<?php foreach ($rows as $u): ?>
  <li class="card">
    <div class="row">
      <div>
        <strong><?= View::e($u['full_name']) ?></strong>
        <div class="meta"><?= View::e($u['email']) ?> · rollen: <?= View::e($u['roles'] ?? '—') ?></div>
      </div>
      <form method="post" action="/admin/users/<?= $u['id'] ?>/role">
        <?= Csrf::field() ?>
        <select name="role">
          <?php foreach (['admin','management','employee'] as $r): ?>
            <option value="<?= $r ?>" <?= str_contains(($u['roles'] ?? ''), $r)?'selected':'' ?>><?= $r ?></option>
          <?php endforeach; ?>
        </select>
        <button class="btn ghost">Instellen</button>
      </form>
    </div>
  </li>
<?php endforeach; ?>
</ul>
