<?php use App\{Csrf, Turnstile}; ?>
<div class="auth-card">
  <h1>Registreren</h1>
  <?php if (!empty($error)): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
  <form method="post" action="/register">
    <?= Csrf::field() ?>
    <label>Volledige naam<input name="full_name" required></label>
    <label>E-mail<input type="email" name="email" required></label>
    <label>Wachtwoord<input type="password" name="password" minlength="8" required></label>
    <?= Turnstile::widget('register') ?>
    <button class="btn primary" type="submit">Registreren</button>
  </form>
  <p><a href="/login">Ik heb al een account</a></p>
</div>
