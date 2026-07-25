<?php use App\View; ?>
<h1>Overzicht</h1>
<form method="get" class="filters card">
  <select name="status">
    <option value="">Alle statussen</option>
    <?php foreach (['pending','confirmed','declined','auto_declined','cancelled'] as $s): ?>
      <option value="<?= $s ?>" <?= ($filters['status'] ?? '')===$s?'selected':'' ?>><?= $s ?></option>
    <?php endforeach; ?>
  </select>
  <select name="assignee">
    <option value="">Alle medewerkers</option>
    <?php foreach ($employees as $e): ?>
      <option value="<?= $e['id'] ?>" <?= ($filters['assignee'] ?? '')===$e['id']?'selected':'' ?>><?= View::e($e['full_name']) ?></option>
    <?php endforeach; ?>
  </select>
  <select name="type">
    <option value="">Alle types</option>
    <?php foreach ($types as $t): ?>
      <option value="<?= $t['id'] ?>" <?= ($filters['type'] ?? '')===$t['id']?'selected':'' ?>><?= View::e($t['name']) ?></option>
    <?php endforeach; ?>
  </select>
  <input type="date" name="from" value="<?= View::e($filters['from'] ?? '') ?>">
  <input type="date" name="to"   value="<?= View::e($filters['to']   ?? '') ?>">
  <label><input type="checkbox" name="unread_only" value="1" <?= !empty($filters['unread_only'])?'checked':'' ?>> Alleen ongelezen</label>
  <button class="btn primary">Filteren</button>
</form>
<ul class="list">
<?php foreach ($rows as $a): $s = $summary[$a['id']] ?? []; ?>
  <li class="card">
    <div class="row">
      <a href="/planning/<?= $a['id'] ?>"><strong><?= View::e($a['title']) ?></strong></a>
      <span class="badge status-<?= $a['status'] ?>"><?= $a['status'] ?></span>
    </div>
    <div class="meta">
      <?= View::fmtDate($a['start_at']) ?> · <?= View::e($a['assignee_name']) ?>
      <?php if ($a['type_name']): ?>· <?= View::e($a['type_name']) ?><?php endif; ?>
    </div>
    <div class="meta">
      <?php foreach ($s as $ch => $st): ?>
        <span class="pill"><?= View::e($ch) ?>:
          <?php foreach ($st as $k=>$c): ?><?= View::e($k) ?> <?= $c ?><?php endforeach; ?>
        </span>
      <?php endforeach; ?>
      <?php if ((int)$a['unread_count']>0): ?><span class="pill warn"><?= $a['unread_count'] ?> ongelezen</span><?php endif; ?>
    </div>
  </li>
<?php endforeach; ?>
<?php if (!$rows): ?><li class="empty">Geen resultaten.</li><?php endif; ?>
</ul>
