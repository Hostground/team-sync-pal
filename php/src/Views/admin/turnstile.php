<?php use App\{Csrf, View}; ?>
<h1>Cloudflare Turnstile</h1>
<p class="muted">Bot-controle op de aanmeld- en registratiepagina. Maak een widget aan in je Cloudflare-dashboard (Turnstile) en vul de site key en secret key hier in. Laat beide velden leeg om de controle uit te schakelen.</p>

<?php if (!empty($flash)): ?>
  <div class="card" style="border-left:4px solid <?= $flash['type']==='ok'?'#16a34a':'#dc2626' ?>">
    <?= View::e($flash['msg']) ?>
  </div>
<?php endif; ?>

<p class="muted"><small>Status: <?= !empty($enabled) ? 'actief' : 'uitgeschakeld' ?></small></p>

<form method="post" action="/admin/turnstile" class="form card">
  <?= Csrf::field() ?>
  <label>Site key (publiek)
    <input name="site_key" value="<?= View::e($cfg['site_key'] ?? '') ?>" placeholder="0x4AAAAAAA..." autocomplete="off">
  </label>
  <label>Secret key
    <input name="secret_key" type="password" value="" placeholder="<?= !empty($cfg['secret_key'])?'••••••••  (laat leeg om ongewijzigd te laten)':'0x4AAAAAAA...' ?>" autocomplete="new-password">
  </label>
  <button class="btn primary">Opslaan</button>
</form>
