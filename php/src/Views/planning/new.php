<?php use App\{Csrf, View}; ?>
<h1>Nieuwe activiteit</h1>
<form method="post" action="/planning/new" class="form">
  <?= Csrf::field() ?>
  <?php if ($templates): ?>
  <label>Vanuit sjabloon
    <select id="tpl">
      <option value="">— geen —</option>
      <?php foreach ($templates as $t): ?>
        <option value='<?= View::e(json_encode($t)) ?>'><?= View::e($t['name']) ?></option>
      <?php endforeach; ?>
    </select>
  </label>
  <?php endif; ?>
  <label>Titel<input name="title" id="title" required></label>
  <label>Type
    <select name="type_id" id="type_id">
      <option value="">—</option>
      <?php foreach ($types as $t): ?><option value="<?= $t['id'] ?>"><?= View::e($t['name']) ?></option><?php endforeach; ?>
    </select>
  </label>
  <label>Medewerker
    <select name="assignee_id" required>
      <?php foreach ($employees as $e): ?><option value="<?= $e['id'] ?>"><?= View::e($e['full_name']) ?></option><?php endforeach; ?>
    </select>
  </label>
  <label>Klant (optioneel)<input name="customer"></label>
  <label>Start<input type="datetime-local" name="start_at" id="start_at" required></label>
  <label>Einde<input type="datetime-local" name="end_at" id="end_at" required></label>
  <label>Locatie<input name="location" id="location"></label>
  <label>Omschrijving<textarea name="description" id="description" rows="3"></textarea></label>
  <label>Bevestigingstermijn (uren, leeg = standaard)<input type="number" min="1" max="720" name="response_window_hours"></label>
  <label class="inline"><input type="checkbox" name="is_rolling" value="1"> Lopende activiteit (schuift automatisch door naar de volgende dag zolang ze niet afgerond is)</label>
  <button class="btn primary" type="submit">Aanmaken</button>
</form>
<script>
document.getElementById('tpl')?.addEventListener('change', e => {
  if (!e.target.value) return;
  const t = JSON.parse(e.target.value);
  ['title','location','description'].forEach(f => { if (t[f]) document.getElementById(f).value = t[f]; });
  if (t.type_id) document.getElementById('type_id').value = t.type_id;
});
</script>
