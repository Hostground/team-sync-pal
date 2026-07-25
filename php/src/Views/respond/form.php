<?php use App\{Csrf, View}; ?>
<div class="auth-card">
  <h1>Reageren op activiteit</h1>
  <p><strong><?= View::e($row['title']) ?></strong></p>
  <form method="post" action="/respond">
    <?= Csrf::field() ?>
    <input type="hidden" name="token" value="<?= View::e($row['token']) ?>">
    <label>Nota (optioneel)<textarea name="note" rows="2"></textarea></label>
    <div>
      <button class="btn primary" name="decision" value="confirmed" <?= $decision==='declined'?'':'' ?>>Bevestigen</button>
      <button class="btn danger"  name="decision" value="declined">Weigeren</button>
    </div>
  </form>
</div>
