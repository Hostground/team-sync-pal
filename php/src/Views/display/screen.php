<?php
/** Fullscreen kiosk-pagina — eigen layout, geen navigatie. */
use App\View;
$payload = $data ?? null;
?><!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Infoscherm<?= $payload ? ' — ' . View::e($payload['name']) : '' ?></title>
<link rel="stylesheet" href="/assets/display.css">
</head>
<body class="display-body">
<?php if (!$payload): ?>
  <div class="display-missing">
    <h1>Infoscherm niet gevonden</h1>
    <p>Controleer de link of vraag een nieuwe code aan.</p>
  </div>
<?php else: ?>
  <div id="screen" class="screen"></div>
  <script>
    window.DISPLAY_CODE = <?= json_encode($code) ?>;
    window.DISPLAY_DATA = <?= json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
  </script>
  <script src="/assets/display.js"></script>
<?php endif; ?>
</body>
</html>
