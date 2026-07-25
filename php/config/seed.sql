-- Voorbeeld activiteitstypes
INSERT INTO activity_types (id, name, color, icon) VALUES
  (UUID(), 'Keuken',       '#f59e0b', 'chef-hat'),
  (UUID(), 'Werk buiten',  '#10b981', 'tree'),
  (UUID(), 'Werk binnen',  '#3b82f6', 'home'),
  (UUID(), 'Onderhoud',    '#8b5cf6', 'wrench'),
  (UUID(), 'Levering',     '#ef4444', 'truck')
ON DUPLICATE KEY UPDATE name=VALUES(name);
