-- =============================================================================
-- Dentales Liberato v2 - Esquema con roles y permisos en tablas separadas
-- Ejecutar: mysql -u root < database/init.sql
-- Luego: npm run db:seed
-- =============================================================================

CREATE DATABASE IF NOT EXISTS dentales_liberato
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dentales_liberato;

-- Roles (tabla separada - seguridad RBAC)
CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo      VARCHAR(50) NOT NULL UNIQUE,
  nombre      VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NULL,
  activo      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Permisos granulares
CREATE TABLE IF NOT EXISTS permisos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo      VARCHAR(80) NOT NULL UNIQUE,
  nombre      VARCHAR(120) NOT NULL,
  modulo      VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NULL
) ENGINE=InnoDB;

-- Relación rol ↔ permiso
CREATE TABLE IF NOT EXISTS rol_permisos (
  rol_id      INT UNSIGNED NOT NULL,
  permiso_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Usuarios (FK a roles, sin ENUM)
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id        INT UNSIGNED NOT NULL,
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Resto de tablas: categorias, proveedores, productos, movimientos,
-- solicitudes_reposicion, auditoria — ver prisma/schema.prisma

-- Datos iniciales vía: npm run db:seed
