<?php use App\{Csrf, View, Turnstile}; ?>
<div class="auth-card">
  <h1>Aanmelden</h1>
  <?php if (($error ?? '') === 'captcha'): ?><p class="error">Bot-controle mislukt. Probeer opnieuw.</p>
  <?php elseif (!empty($error)): ?><p class="error">Ongeldige inloggegevens.</p><?php endif; ?>
  <form method="post" action="/login">
    <?= Csrf::field() ?>
    <label>E-mail<input type="email" name="email" required></label>
    <label>Wachtwoord<input type="password" name="password" required></label>
    <?= Turnstile::widget('login') ?>
    <button class="btn primary" type="submit">Aanmelden</button>
  </form>
  <button id="webauthn-login" class="btn ghost" type="button">Aanmelden met vingerafdruk</button>
  <p><a href="/register">Nieuw account aanmaken</a></p>
</div>
