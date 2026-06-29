-- bz-admin — reference schema
-- These tables are created AUTOMATICALLY on first start when Config.Database
-- = true and oxmysql is running. Import this only if you prefer to set them
-- up manually.

CREATE TABLE IF NOT EXISTS `bz_admin_bans` (
  `id` VARCHAR(16) NOT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `identifiers` LONGTEXT DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `admin` VARCHAR(100) DEFAULT NULL,
  `admin_id` VARCHAR(64) DEFAULT NULL,
  `created` BIGINT DEFAULT 0,
  `expires` BIGINT DEFAULT 0,
  `active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bz_admin_warns` (
  `id` VARCHAR(16) NOT NULL,
  `identifier` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `admin` VARCHAR(100) DEFAULT NULL,
  `created` BIGINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bz_admin_notes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `identifier` VARCHAR(64) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `admin` VARCHAR(100) DEFAULT NULL,
  `created` BIGINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
