<?php use App\{Csrf, View}; ?>
<h1>SMTP-instellingen</h1>
<p class="muted">Deze waarden overschrijven de <code>smtp</code>-sectie in <code>config/config.php</code>. Laat een veld leeg om de waarde uit het configuratiebestand te gebruiken.</p>

<?php if (!empty($flash)): ?>
  <div class="card" style="border-left:4px solid <?= $flash['type']==='ok'?'#16a34a':'#dc2626' ?>">
    <?= View::e($flash['msg']) ?>
  </div>
<?php endif; ?>

<form method="post" action="/admin/smtp" class="form card">
  <?= Csrf::field() ?>
  <label>Host
    <input name="host" value="<?= View::e($cfg['host'] ?? '') ?>" placeholder="mail.example.com">
  </label>
  <label>Poort
    <input name="port" type="number" value="<?= View::e($cfg['port'] ?? '') ?>" placeholder="587">
  </label>
  <label>Beveiliging
    <select name="secure">
      <?php $sec = $cfg['secure'] ?? ''; ?>
      <option value=""    <?= $sec===''   ?'selected':'' ?>>Geen</option>
      <option value="tls" <?= $sec==='tls'?'selected':'' ?>>TLS (STARTTLS)</option>
      <option value="ssl" <?= $sec==='ssl'?'selected':'' ?>>SSL</option>
    </select>
  </label>
  <label>Gebruikersnaam
    <input name="username" value="<?= View::e($cfg['username'] ?? '') ?>" autocomplete="off">
  </label>
  <label>Wachtwoord
    <input name="password" type="password" value="" placeholder="<?= !empty($cfg['password'])?'••••••••  (laat leeg om ongewijzigd te laten)':'' ?>" autocomplete="new-password">
  </label>
  <label>Afzender-adres
    <input name="from" type="email" value="<?= View::e($cfg['from'] ?? '') ?>" placeholder="noreply@example.com">
  </label>
  <label>Afzender-naam
    <input name="fromName" value="<?= View::e($cfg['fromName'] ?? '') ?>" placeholder="Planning">
  </label>
  <button class="btn primary">Opslaan</button>
</form>

<h2>Testmail versturen</h2>
<form method="post" action="/admin/smtp/test" class="form card">
  <?= Csrf::field() ?>
  <label>Verstuur naar
    <input name="to" type="email" required placeholder="jij@voorbeeld.be">
  </label>
  <button class="btn">Testmail versturen</button>
</form>

<?php if ($overridden): ?>
  <p class="muted"><small>Overschreven via database: <?= View::e(implode(', ', array_keys($overridden))) ?></small></p>
<?php endif; ?>
