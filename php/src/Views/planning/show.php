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
  <?php if (!empty($a['is_rolling'])): ?>
    <p class="muted">Lopende activiteit — schuift automatisch door naar de volgende dag zolang ze niet afgerond is.
    <?php if ((int)($a['rollover_count'] ?? 0) > 0): ?> Al <?= (int)$a['rollover_count'] ?>× doorgeschoven.<?php endif; ?>
    <?php if (!empty($a['original_start_at'])): ?> Oorspronkelijk: <?= View::fmtDate($a['original_start_at']) ?>.<?php endif; ?></p>
  <?php endif; ?>
  <?php if (!empty($a['completed_at'])): ?><p class="muted">Afgerond op <?= View::fmtDate($a['completed_at']) ?></p><?php endif; ?>
</div>

<?php if (!in_array($a['status'], ['completed','cancelled'], true) && (Auth::isStaff() || $a['assignee_id']===Auth::id())): ?>
<form method="post" action="/planning/<?= $a['id'] ?>/complete" class="card form">
  <?= Csrf::field() ?>
  <button class="btn" type="submit">Activiteit afronden</button>
</form>
<?php endif; ?>


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

<h2>Locatie op de kaart</h2>
<div class="card">
  <?php if ($a['lat'] !== null && $a['lng'] !== null): ?>
    <div class="map-box" data-map-view
         data-lat="<?= View::e((string)$a['lat']) ?>" data-lng="<?= View::e((string)$a['lng']) ?>"
         data-label="<?= View::e($a['location'] ?: $a['title']) ?>"
         data-photo-pins='<?= View::e(json_encode(array_values(array_map(
              fn($p) => ['lat'=>(float)$p['lat'],'lng'=>(float)$p['lng']],
              array_filter($photos ?? [], fn($p) => $p['lat'] !== null && $p['lng'] !== null)
         )))) ?>'></div>
    <p class="map-actions">
      <a class="btn small" target="_blank" rel="noopener"
         href="https://www.openstreetmap.org/?mlat=<?= (float)$a['lat'] ?>&mlon=<?= (float)$a['lng'] ?>#map=17/<?= (float)$a['lat'] ?>/<?= (float)$a['lng'] ?>">Route / openen in kaart</a>
      <span class="muted"><?= (float)$a['lat'] ?>, <?= (float)$a['lng'] ?></span>
    </p>
  <?php else: ?>
    <p class="muted">Nog geen pin op de kaart gezet.</p>
  <?php endif; ?>

  <?php if (Auth::isStaff() || $a['assignee_id'] === Auth::id()): ?>
  <form method="post" action="/planning/<?= $a['id'] ?>/location" class="map-field">
    <?= Csrf::field() ?>
    <span class="label-text">Pin aanpassen</span>
    <div class="map-box" data-map-picker data-lat-input="pin_lat" data-lng-input="pin_lng"></div>
    <input type="hidden" name="lat" id="pin_lat" value="<?= $a['lat'] !== null ? View::e((string)$a['lat']) : '' ?>">
    <input type="hidden" name="lng" id="pin_lng" value="<?= $a['lng'] !== null ? View::e((string)$a['lng']) : '' ?>">
    <div class="map-actions">
      <button type="button" class="btn small" data-map-gps>Mijn locatie</button>
      <button type="button" class="btn small" data-map-default>Vaste werkplek</button>
      <button type="button" class="btn small" data-map-clear>Pin wissen</button>
      <span class="muted map-coords"><?= $a['lat'] !== null ? View::e((string)$a['lat'].', '.$a['lng']) : 'Geen pin' ?></span>
      <button class="btn small primary" type="submit">Locatie bewaren</button>
    </div>
  </form>
  <?php endif; ?>
</div>

<h2>Foto's</h2>
<div class="card" data-photos data-activity="<?= $a['id'] ?>" data-csrf="<?= View::e(Csrf::token()) ?>"
     data-staff="<?= Auth::isStaff() ? '1' : '0' ?>" data-me="<?= View::e(Auth::id()) ?>">
  <?php if (Auth::isStaff() || $a['assignee_id'] === Auth::id()): ?>
  <label class="label-text">Foto's toevoegen (camera of galerij)
    <input type="file" accept="image/*" capture="environment" multiple>
  </label>
  <label class="inline"><input type="checkbox" data-photo-gps checked> Huidige locatie bij de foto bewaren</label>
  <p class="muted" data-photo-status></p>
  <?php endif; ?>
  <div class="photo-grid" data-photo-grid></div>
</div>


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
