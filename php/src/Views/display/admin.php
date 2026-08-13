<?php use App\{Csrf, View};
$err = $_SESSION['flash_error'] ?? null; unset($_SESSION['flash_error']);
$tplById = [];
foreach ($templates as $t) { $tplById[$t['id']] = $t; }
$current = $templateId && isset($tplById[$templateId]) ? $tplById[$templateId] : null;
$theme = $current && $current['theme'] ? (json_decode((string)$current['theme'], true) ?: []) : [];
$base = (!empty($_SERVER['HTTPS']) ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? '');
?>
<h1>Infoscherm</h1>
<?php if ($err): ?><p class="error"><?= View::e($err) ?></p><?php endif; ?>

<h2>Schermen</h2>
<form method="post" action="/display-admin/displays" class="form card">
  <?= Csrf::field() ?>
  <label>Naam<input name="name" required placeholder="TV inkomhal"></label>
  <label>Template
    <select name="template_id">
      <option value="">— geen —</option>
      <?php foreach ($templates as $t): ?>
        <option value="<?= $t['id'] ?>"><?= View::e($t['name']) ?></option>
      <?php endforeach; ?>
    </select>
  </label>
  <label>Tijdzone<input name="timezone" value="Europe/Brussels"></label>
  <button class="btn primary">Scherm toevoegen</button>
</form>

<ul class="list">
<?php foreach ($displays as $d): $link = $base . '/display/' . $d['code']; ?>
  <li class="card">
    <form method="post" action="/display-admin/displays" class="row" style="gap:.5rem;flex-wrap:wrap">
      <?= Csrf::field() ?>
      <input type="hidden" name="id" value="<?= $d['id'] ?>">
      <input name="name" value="<?= View::e($d['name']) ?>" required>
      <select name="template_id">
        <option value="">— geen —</option>
        <?php foreach ($templates as $t): ?>
          <option value="<?= $t['id'] ?>" <?= $t['id'] === $d['template_id'] ? 'selected' : '' ?>><?= View::e($t['name']) ?></option>
        <?php endforeach; ?>
      </select>
      <input name="timezone" value="<?= View::e($d['timezone']) ?>">
      <label><input type="checkbox" name="active" <?= $d['active'] ? 'checked' : '' ?>> Actief</label>
      <button class="btn ghost">Opslaan</button>
    </form>
    <p class="muted" style="word-break:break-all">
      <a href="/display/<?= $d['code'] ?>" target="_blank" rel="noopener">Open op TV</a>
      — <code data-copy="<?= View::e($link) ?>"><?= View::e($link) ?></code>
    </p>
    <div class="row" style="gap:.5rem">
      <form method="post" action="/display-admin/displays/<?= $d['id'] ?>/regen"><?= Csrf::field() ?><button class="linkbtn">Nieuwe code</button></form>
      <form method="post" action="/display-admin/displays/<?= $d['id'] ?>/delete" onsubmit="return confirm('Scherm verwijderen?')"><?= Csrf::field() ?><button class="linkbtn">Verwijderen</button></form>
    </div>
  </li>
<?php endforeach; ?>
</ul>

<h2>Templates</h2>
<p class="row" style="gap:.5rem;flex-wrap:wrap">
  <?php foreach ($templates as $t): ?>
    <a class="btn <?= $t['id'] === $templateId ? 'primary' : 'ghost' ?>" href="/display-admin?template=<?= urlencode($t['id']) ?>"><?= View::e($t['name']) ?></a>
  <?php endforeach; ?>
</p>

<form method="post" action="/display-admin/templates" class="form card">
  <?= Csrf::field() ?>
  <?php if ($current): ?><input type="hidden" name="id" value="<?= $current['id'] ?>"><?php endif; ?>
  <label>Naam<input name="name" value="<?= View::e($current['name'] ?? '') ?>" required></label>
  <label>Achtergrondkleur<input name="bg" value="<?= View::e($theme['bg'] ?? '#0b1220') ?>"></label>
  <label>Tekstkleur<input name="text" value="<?= View::e($theme['text'] ?? '#ffffff') ?>"></label>
  <label>Overlay (0–1)<input name="overlay" type="number" step="0.05" min="0" max="1" value="<?= View::e((string)($theme['overlay'] ?? 0.35)) ?>"></label>
  <label>Tekstgrootte<input name="textScale" type="number" step="0.1" min="0.5" max="2" value="<?= View::e((string)($theme['textScale'] ?? 1)) ?>"></label>
  <label>Standaard slideduur (s)<input name="default_slide_seconds" type="number" min="3" value="<?= View::e((string)($current['default_slide_seconds'] ?? 10)) ?>"></label>
  <label><input type="checkbox" name="show_clock" <?= ($current === null || $current['show_clock']) ? 'checked' : '' ?>> Klok en datum tonen</label>
  <label>Klokpositie
    <select name="clock_position">
      <?php foreach (['top-left'=>'Linksboven','top-right'=>'Rechtsboven','bottom-left'=>'Linksonder','bottom-right'=>'Rechtsonder'] as $k => $lbl): ?>
        <option value="<?= $k ?>" <?= ($current['clock_position'] ?? 'top-right') === $k ? 'selected' : '' ?>><?= $lbl ?></option>
      <?php endforeach; ?>
    </select>
  </label>
  <button class="btn primary"><?= $current ? 'Template opslaan' : 'Template toevoegen' ?></button>
</form>
<?php if ($current): ?>
  <form method="post" action="/display-admin/templates/<?= $current['id'] ?>/delete" onsubmit="return confirm('Template en slides verwijderen?')"><?= Csrf::field() ?><button class="linkbtn">Template verwijderen</button></form>
<?php endif; ?>

<?php if ($current): ?>
<h2>Slides — <?= View::e($current['name']) ?></h2>
<form method="post" action="/display-admin/slides" class="form card" enctype="multipart/form-data">
  <?= Csrf::field() ?>
  <input type="hidden" name="template_id" value="<?= $current['id'] ?>">
  <label>Type
    <select name="kind">
      <option value="text">Tekst</option>
      <option value="photos">Foto's</option>
      <option value="planning_today">Planning vandaag</option>
    </select>
  </label>
  <label>Titel<input name="title"></label>
  <label>Tekst<textarea name="body" rows="3"></textarea></label>
  <label>Duur (s, leeg = standaard)<input name="seconds" type="number" min="3"></label>
  <label>Afbeeldingen<input type="file" name="media[]" accept="image/*" multiple></label>
  <button class="btn primary">Slide toevoegen</button>
</form>

<ul class="list">
<?php foreach ($slides as $i => $s): $media = $s['media'] ? (json_decode((string)$s['media'], true) ?: []) : []; ?>
  <li class="card">
    <form method="post" action="/display-admin/slides" enctype="multipart/form-data" class="form">
      <?= Csrf::field() ?>
      <input type="hidden" name="id" value="<?= $s['id'] ?>">
      <input type="hidden" name="template_id" value="<?= $current['id'] ?>">
      <label>Type
        <select name="kind">
          <?php foreach (['text'=>'Tekst','photos'=>"Foto's",'planning_today'=>'Planning vandaag'] as $k => $lbl): ?>
            <option value="<?= $k ?>" <?= $s['kind'] === $k ? 'selected' : '' ?>><?= $lbl ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Titel<input name="title" value="<?= View::e($s['title']) ?>"></label>
      <label>Tekst<textarea name="body" rows="3"><?= View::e($s['body']) ?></textarea></label>
      <label>Duur (s)<input name="seconds" type="number" min="3" value="<?= View::e((string)($s['seconds'] ?? '')) ?>"></label>
      <label><input type="checkbox" name="active" <?= $s['active'] ? 'checked' : '' ?>> Actief</label>
      <?php if ($media): ?>
        <div class="row" style="gap:.5rem;flex-wrap:wrap">
          <?php foreach ($media as $m): ?>
            <label style="text-align:center">
              <img src="<?= View::e($m) ?>" alt="" style="width:110px;height:70px;object-fit:cover;border-radius:6px;display:block">
              <input type="checkbox" name="remove_media[]" value="<?= View::e($m) ?>"> verwijderen
            </label>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
      <label>Afbeeldingen toevoegen<input type="file" name="media[]" accept="image/*" multiple></label>
      <button class="btn ghost">Opslaan</button>
    </form>
    <div class="row" style="gap:.5rem">
      <form method="post" action="/display-admin/slides/<?= $s['id'] ?>/move"><?= Csrf::field() ?><input type="hidden" name="dir" value="up"><button class="linkbtn" <?= $i === 0 ? 'disabled' : '' ?>>↑ Omhoog</button></form>
      <form method="post" action="/display-admin/slides/<?= $s['id'] ?>/move"><?= Csrf::field() ?><input type="hidden" name="dir" value="down"><button class="linkbtn" <?= $i === count($slides) - 1 ? 'disabled' : '' ?>>↓ Omlaag</button></form>
      <form method="post" action="/display-admin/slides/<?= $s['id'] ?>/delete" onsubmit="return confirm('Slide verwijderen?')"><?= Csrf::field() ?><button class="linkbtn">Verwijderen</button></form>
    </div>
  </li>
<?php endforeach; ?>
</ul>
<?php endif; ?>
