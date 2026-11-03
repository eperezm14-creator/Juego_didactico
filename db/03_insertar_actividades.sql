INSERT INTO juego_didactico.actividades
    (codigo, nombre, nivel, categoria, instrucciones)
VALUES
    (
        'ubicacion_juguetes',
        'Ubica los juguetes',
        'preprimario',
        'espacio',
        'Observa los juguetes e identifica adentro y afuera, arriba y abajo, cerca y lejos, encima y debajo.'
    ),
    (
        'reconocer_figuras',
        'Reconoce las figuras',
        'preprimario',
        'figuras',
        'Identifica círculos, cuadrados, triángulos y rectángulos.'
    ),
    (
        'memoria_simbolos',
        'Memoria de símbolos de Guatemala',
        'preprimario',
        'memoria',
        'Encuentra las parejas de imágenes de los símbolos nacionales de Guatemala.'
    ),
    (
        'tablas_multiplicar',
        'Tablas de multiplicar',
        'primario',
        'multiplicaciones',
        'Resuelve multiplicaciones y comprueba tus respuestas.'
    ),
    (
        'sumar_fracciones',
        'Suma de fracciones',
        'primario',
        'fracciones',
        'Resuelve sumas de fracciones y selecciona el resultado correcto.'
    ),
    (
        'multiplicar_decimales',
        'Multiplicación de decimales',
        'primario',
        'decimales',
        'Resuelve multiplicaciones con números decimales.'
    )
ON DUPLICATE KEY UPDATE codigo = codigo;

UPDATE juego_didactico.actividades
SET instrucciones =
    'Observa los juguetes e identifica adentro y afuera, arriba y abajo, cerca y lejos, encima y debajo.'
WHERE codigo = 'ubicacion_juguetes';

SELECT id_actividad, codigo, nombre, nivel, categoria, activa
FROM juego_didactico.actividades
ORDER BY nivel, id_actividad;