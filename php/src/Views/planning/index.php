<?php use App\View; ?>
<h1>Planning</h1>
<form method="get" class="filters">
  <select name="status" onchange="this.form.submit()">
    <option value="">Alle statussen</option>
    <?php foreach (['pending'=>'In afwachting','confirmed'=>'Bevestigd','declined'=>'Geweigerd','auto_declined'=>'Auto-geweigerd','cancelled'=>'Geannuleerd'] as $k=>$v): ?>
      <option value="<?= $k ?>" <?= ($_GET['status'] ?? '')===$k?'selected':'' ?>><?= $v ?></option>
    <?php endforeach; ?>
  </select>
</form>
<ul class="list">
<?php foreach ($rows as $a): $overdue = $a['status']==='pending' && strtotime($a['respond_by'])<time(); ?>
  <li>
    <a href="/planning/<?= $a['id'] ?>" class="card">
      <div class="row">
        <strong><?= View::e($a['title']) ?></strong>
        <span class="badge status-<?= $a['status'] ?>"><?= $a['status'] ?></span>
      </div>
      <div class="meta">
        <?= View::fmtDate($a['start_at'],'d/m H:i') ?> – <?= View::fmtDate($a['end_at'],'H:i') ?>
        · <?= View::e($a['assignee_name']) ?>
        <?php if ($a['type_name']): ?>· <?= View::e($a['type_name']) ?><?php endif; ?>
        <?php if ($a['status']==='pending'): ?>
          · <span class="<?= $overdue?'overdue':'' ?>"><?= $overdue?'Verlopen':'Reageren voor' ?> <?= View::fmtDate($a['respond_by'],'d/m H:i') ?></span>
        <?php endif; ?>
      </div>
    </a>
  </li>
<?php endforeach; ?>
<?php if (!$rows): ?><li class="empty">Geen activiteiten.</li><?php endif; ?>
</ul>
