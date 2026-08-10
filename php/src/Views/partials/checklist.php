<?php
/**
 * Live takenlijst widget.
 * Verwacht: $checklistScope = ['activity_id' => '...'] of [] (persoonlijk)
 *           $checklistTemplates (array, optioneel)
 */
use App\{Csrf, Auth};
$activityId = $checklistScope['activity_id'] ?? '';
$templates  = $checklistTemplates ?? [];
?>
<section class="card checklist" data-checklist data-activity="<?= htmlspecialchars((string)$activityId) ?>">
  <div class="checklist-head">
    <h2>Takenlijst</h2>
    <span class="badge" data-checklist-progress>0/0</span>
  </div>

  <ul class="checklist-items" data-checklist-list>
    <li class="muted">Laden…</li>
  </ul>

  <form class="checklist-add" data-checklist-add autocomplete="off">
    <input type="text" name="title" placeholder="Nieuwe taak…" required maxlength="255" inputmode="text">
    <button class="btn primary" type="submit">+</button>
  </form>

  <div class="checklist-tools">
    <?php if ($templates): ?>
      <form class="inline" data-checklist-apply>
        <select name="template_id" required>
          <option value="">Sjabloon toevoegen…</option>
          <?php foreach ($templates as $t): ?>
            <option value="<?= htmlspecialchars($t['id']) ?>"><?= htmlspecialchars($t['name']) ?></option>
          <?php endforeach; ?>
        </select>
        <button class="btn" type="submit">Toevoegen</button>
      </form>
    <?php endif; ?>

    <?php if (Auth::isStaff()): ?>
      <form class="inline" data-checklist-save-template>
        <input type="text" name="name" placeholder="Bewaar als sjabloon…" maxlength="150" required>
        <button class="btn" type="submit">Bewaren</button>
      </form>
    <?php endif; ?>

    <?php if ($activityId && !empty($copyOptions)): ?>
      <form class="inline" data-checklist-copy>
        <select name="from_activity_id" required>
          <option value="">Kopieer taken van…</option>
          <?php foreach ($copyOptions as $c): ?>
            <option value="<?= htmlspecialchars($c['id']) ?>"><?= htmlspecialchars($c['title']) ?></option>
          <?php endforeach; ?>
        </select>
        <button class="btn" type="submit">Kopiëren</button>
      </form>
    <?php endif; ?>
  </div>
</section>
