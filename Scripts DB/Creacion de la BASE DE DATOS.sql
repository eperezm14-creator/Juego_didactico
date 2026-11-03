-- Crear la base de datos del proyecto si todavía no existe.
CREATE DATABASE IF NOT EXISTS juego_didactico
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Seleccionar la base de datos para esta sesión.
USE juego_didactico;

-- Comprobar la base seleccionada y la versión del servidor.
SELECT
    DATABASE() AS base_de_datos_actual,
    VERSION() AS version_del_servidor;

-- Comprobar el cifrado de la conexión actual.
SHOW SESSION STATUS LIKE 'Ssl_cipher';