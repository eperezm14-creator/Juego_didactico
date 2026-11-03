USE juego_didactico;

CREATE TABLE IF NOT EXISTS estudiantes (
    id_estudiante INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    edad SMALLINT UNSIGNED NOT NULL,
    nivel ENUM('preprimario', 'primario') NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_estudiante_edad CHECK (edad > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS actividades (
    id_actividad INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    nivel ENUM('preprimario', 'primario') NOT NULL,
    categoria ENUM(
        'espacio',
        'figuras',
        'memoria',
        'multiplicaciones',
        'fracciones',
        'decimales'
    ) NOT NULL,
    instrucciones TEXT NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resultados (
    id_resultado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT UNSIGNED NOT NULL,
    id_actividad INT UNSIGNED NOT NULL,
    aciertos INT UNSIGNED NOT NULL,
    total_preguntas INT UNSIGNED NOT NULL,
    puntaje INT UNSIGNED NOT NULL,
    fecha_finalizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_resultado_preguntas
        CHECK (total_preguntas > 0),
    CONSTRAINT chk_resultado_aciertos
        CHECK (aciertos <= total_preguntas),
    CONSTRAINT chk_resultado_puntaje
        CHECK (puntaje <= 100),

    CONSTRAINT fk_resultado_estudiante
        FOREIGN KEY (id_estudiante)
        REFERENCES estudiantes(id_estudiante)
        ON DELETE RESTRICT,

    CONSTRAINT fk_resultado_actividad
        FOREIGN KEY (id_actividad)
        REFERENCES actividades(id_actividad)
        ON DELETE RESTRICT,

    INDEX idx_resultados_estudiante_fecha
        (id_estudiante, fecha_finalizacion),
    INDEX idx_resultados_actividad
        (id_actividad)
) ENGINE=InnoDB;

SHOW TABLES;