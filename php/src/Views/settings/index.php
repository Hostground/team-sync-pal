<?php use App\{Csrf, View}; ?>
<h1>Instellingen</h1>
<?php if (!empty($_GET['saved'])): ?><p class="ok">Opgeslagen.</p><?php endif; ?>
<form method="post" action="/settings" class="form card">
  <?= Csrf::field() ?>
  <label>Naam<input name="full_name" value="<?= View::e($u['full_name']) ?>"></label>
  <label>Telefoon<input name="phone" value="<?= View::e($u['phone']) ?>"></label>
  <fieldset>
    <legend>Meldingen</legend>
    <label><input type="checkbox" name="notif_email" <?= $u['notif_email']?'checked':'' ?>> E-mail</label>
    <label><input type="checkbox" name="notif_push"  <?= $u['notif_push']?'checked':'' ?>> Push</label>
    <label><input type="checkbox" name="notif_inapp" <?= $u['notif_inapp']?'checked':'' ?>> In-app</label>
  </fieldset>
  <button class="btn primary">Opslaan</button>
</form>

<div class="card">
  <h2>Vingerafdruk / passkey</h2>
  <p>Vereist HTTPS. Registreer een vingerafdruk of passkey op dit toestel om sneller aan te melden.</p>
  <button id="webauthn-register" class="btn ghost" type="button">Vingerafdruk registreren</button>
</div>

<div class="card">
  <h2>Push-meldingen op dit toestel</h2>
  <button id="push-subscribe" class="btn ghost" data-vapid="<?= View::e($vapidKey) ?>" type="button">Push activeren</button>
</div>
