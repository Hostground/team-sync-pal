-- Planning systeem — MySQL schema
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  biometric_enabled TINYINT(1) NOT NULL DEFAULT 0,
  notif_email TINYINT(1) NOT NULL DEFAULT 1,
  notif_push  TINYINT(1) NOT NULL DEFAULT 1,
  notif_inapp TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role ENUM('admin','management','employee') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_role (user_id, role),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_types (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(20) NULL,
  icon VARCHAR(50) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activities (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type_id CHAR(36) NULL,
  assignee_id CHAR(36) NOT NULL,
  created_by CHAR(36) NOT NULL,
  customer VARCHAR(200) NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  location VARCHAR(200) NULL,
  description TEXT NULL,
  status ENUM('pending','confirmed','declined','auto_declined','cancelled','completed') NOT NULL DEFAULT 'pending',
  respond_by DATETIME NOT NULL,
  responded_at DATETIME NULL,
  response_note TEXT NULL,
  template_id CHAR(36) NULL,
  reminder_sent_at DATETIME NULL,
  is_rolling TINYINT(1) NOT NULL DEFAULT 0,
  completed_at DATETIME NULL,
  completed_by CHAR(36) NULL,
  rollover_count INT NOT NULL DEFAULT 0,
  original_start_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_status (status),
  KEY idx_assignee (assignee_id),
  KEY idx_respond_by (respond_by),
  CONSTRAINT fk_act_type FOREIGN KEY (type_id) REFERENCES activity_types(id) ON DELETE SET NULL,
  CONSTRAINT fk_act_ass  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_act_cre  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_templates (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  owner_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  type_id CHAR(36) NULL,
  duration_minutes INT NULL,
  location VARCHAR(200) NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tpl_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tpl_type  FOREIGN KEY (type_id) REFERENCES activity_types(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  activity_id CHAR(36) NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user (user_id, read_at),
  KEY idx_activity (activity_id),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_act  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id CHAR(36) NOT NULL PRIMARY KEY,
  notification_id CHAR(36) NOT NULL,
  channel ENUM('email','push','inapp') NOT NULL,
  status  ENUM('queued','sent','failed','delivered','read') NOT NULL DEFAULT 'queued',
  sent_at DATETIME NULL,
  delivered_at DATETIME NULL,
  read_at DATETIME NULL,
  error TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notif (notification_id),
  CONSTRAINT fk_del_notif FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS response_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  activity_id CHAR(36) NOT NULL,
  token CHAR(64) NOT NULL UNIQUE,
  used_at DATETIME NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tok_act FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  credential_id VARBINARY(512) NOT NULL,
  public_key TEXT NOT NULL,
  sign_count BIGINT NOT NULL DEFAULT 0,
  transports VARCHAR(100) NULL,
  label VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_cred (credential_id),
  CONSTRAINT fk_wa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(100) NOT NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user (user_id),
  CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_audit_log (
  id CHAR(36) NOT NULL PRIMARY KEY,
  activity_id CHAR(36) NOT NULL,
  actor_id CHAR(36) NULL,
  action ENUM('created','confirmed','declined','auto_declined','rescheduled','cancelled','updated') NOT NULL,
  previous_status VARCHAR(30) NULL,
  new_status VARCHAR(30) NULL,
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_activity (activity_id, created_at),
  CONSTRAINT fk_audit_act   FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id)    REFERENCES users(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `value` TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO settings(`key`,`value`) VALUES
  ('default_response_window_hours','24'),
  ('reminder_hours_before','2'),
  ('allow_per_activity_override','1')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);

SET FOREIGN_KEY_CHECKS=1;

-- =============================
-- Takenlijsten (checklists)
-- =============================
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS checklist_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  activity_id CHAR(36) NULL,
  owner_id CHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  done_at DATETIME NULL,
  done_by CHAR(36) NULL,
  position INT NOT NULL DEFAULT 0,
  created_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_activity (activity_id, position),
  KEY idx_owner (owner_id, position),
  CONSTRAINT fk_cli_act   FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_cli_owner FOREIGN KEY (owner_id)    REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_cli_by    FOREIGN KEY (created_by)  REFERENCES users(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS checklist_templates (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  created_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_clt_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS checklist_template_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  template_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  KEY idx_tpl (template_id, position),
  CONSTRAINT fk_clti_tpl FOREIGN KEY (template_id) REFERENCES checklist_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;

-- =============================
-- Infoscherm (lobby TV)
-- =============================
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS display_templates (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  theme TEXT NULL,
  show_clock TINYINT(1) NOT NULL DEFAULT 1,
  clock_position VARCHAR(20) NOT NULL DEFAULT 'top-right',
  default_slide_seconds INT NOT NULL DEFAULT 10,
  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dtpl_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS display_slides (
  id CHAR(36) NOT NULL PRIMARY KEY,
  template_id CHAR(36) NOT NULL,
  kind ENUM('text','photos','planning_today') NOT NULL DEFAULT 'text',
  position INT NOT NULL DEFAULT 0,
  title VARCHAR(200) NULL,
  body TEXT NULL,
  media TEXT NULL,
  seconds INT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_tpl (template_id, position),
  CONSTRAINT fk_dsl_tpl FOREIGN KEY (template_id) REFERENCES display_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS displays (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  template_id CHAR(36) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/Brussels',
  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_disp_tpl FOREIGN KEY (template_id) REFERENCES display_templates(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;
