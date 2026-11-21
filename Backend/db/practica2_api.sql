-- ============================================================
--  API con sesiones  -  Practica 2
--  Base de datos de usuarios para /login, /logout, /perfil y /estado
--  Motor: MySQL / MariaDB (XAMPP)
--
--  Importar desde phpMyAdmin -> pestana "Importar"
--  o desde terminal:
--    /Applications/XAMPP/xamppfiles/bin/mysql -u root < practica2_api.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS practica2_api
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE practica2_api;

DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre   VARCHAR(100) NOT NULL,
    correo   VARCHAR(150) NOT NULL,
    password VARCHAR(100) NOT NULL,   -- sin encriptar, tal como lo pidio la practica
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    -- Dos usuarios no pueden tener el mismo correo: es con lo que se inicia sesion
    UNIQUE KEY uq_usuarios_correo (correo),
    CONSTRAINT chk_correo_tiene_arroba CHECK (correo LIKE '%@%')
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  Usuarios de prueba
-- ------------------------------------------------------------
INSERT INTO usuarios (nombre, correo, password) VALUES
('Arturo Reyes del Real', 'arturo@ceti.mx', '12345'),
('Paola Ponce',           'paola@ceti.mx',  'profesora'),
('Alumno Demo',           'alumno@ceti.mx', 'demo123');

-- Comprobacion rapida
SELECT id, nombre, correo FROM usuarios;
