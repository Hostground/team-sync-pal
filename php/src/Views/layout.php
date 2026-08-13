<?php
use App\{Auth, View, Csrf};
$user = Auth::user();
$roles = Auth::roles();
$unread = 0;
if ($user) {
    $unread = (int)(\App\Db::one('SELECT COUNT(*) AS c FROM notifications WHERE user_id=? AND read_at IS NULL', [$user['id']])['c'] ?? 0);
}
?><!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= View::e($title ?? 'Planning') ?> — <?= View::e(\App\Config::get('app.name','Planning')) ?></title>
<link rel="stylesheet" href="/assets/app.css">
</head>
<body>
<?php if ($user): ?>
<header class="topbar">
  <a href="/planning" class="brand"><?= View::e(\App\Config::get('app.name','Planning')) ?></a>
  <nav>
    <a href="/planning">Planning</a>
    <a href="/taken">Taken</a>
    <?php if (Auth::isStaff()): ?>
      <a href="/planning/new">Nieuw</a>
      <a href="/overzicht">Overzicht</a>
      <a href="/templates">Sjablonen</a>
      <a href="/checklist-templates">Checklists</a>
      <a href="/display-admin">Infoscherm</a>
    <?php endif; ?>
    <a href="/notifications">Meldingen<?php if ($unread): ?> <span class="badge"><?= $unread ?></span><?php endif; ?></a>
    <?php if (Auth::isAdmin()): ?>
      <a href="/admin/users">Gebruikers</a>
      <a href="/admin/types">Types</a>
      <a href="/admin/smtp">SMTP</a>
    <?php endif; ?>
    <a href="/settings">Instellingen</a>
    <form method="post" action="/logout" style="display:inline"><?= Csrf::field() ?><button class="linkbtn">Afmelden</button></form>
  </nav>
</header>
<?php endif; ?>
<main class="container"><?= $content ?></main>
<script>window.CSRF_TOKEN = <?= json_encode(Csrf::token()) ?>;</script>
<script src="/assets/app.js"></script>
</body>
</html>
