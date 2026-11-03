import baseDatos from '../configuracion/baseDatos.js';

export async function registrarEstudiante(solicitud, respuesta) {
    const { nombre, edad, nivel } = solicitud.body;
    const nombreLimpio =
        typeof nombre === 'string' ? nombre.trim() : '';
    const edadNumero = Number(edad);

    if (
        !nombreLimpio ||
        nombreLimpio.length > 120 ||
        !Number.isInteger(edadNumero) ||
        edadNumero < 1 ||
        edadNumero > 65535 ||
        !['preprimario', 'primario'].includes(nivel)
    ) {
        return respuesta.status(400).json({
            correcto: false,
            mensaje: 'Verifica el nombre, la edad y el nivel del estudiante.',
        });
    }

    try {
        const [resultado] = await baseDatos.execute(
            `INSERT INTO estudiantes (nombre, edad, nivel)
             VALUES (?, ?, ?)`,
            [nombreLimpio, edadNumero, nivel]
        );

        return respuesta.status(201).json({
            correcto: true,
            estudiante: {
                id_estudiante: resultado.insertId,
                nombre: nombreLimpio,
                edad: edadNumero,
                nivel,
            },
        });
    } catch (error) {
        console.error('Error al registrar estudiante:', error);

        return respuesta.status(500).json({
            correcto: false,
            mensaje: 'No se pudo registrar al estudiante.',
        });
    }
}

export async function listarEstudiantes(solicitud, respuesta) {
    const { nivel } = solicitud.query;

    if (!['preprimario', 'primario'].includes(nivel)) {
        return respuesta.status(400).json({
            correcto: false,
            mensaje: 'Selecciona un nivel válido.',
        });
    }

    try {
        const [estudiantes] = await baseDatos.execute(
            `SELECT id_estudiante, nombre, edad, nivel
             FROM estudiantes
             WHERE nivel = ?
             ORDER BY nombre, id_estudiante`,
            [nivel]
        );

        return respuesta.json({
            correcto: true,
            estudiantes,
        });
    } catch (error) {
        console.error('Error al consultar estudiantes:', error);

        return respuesta.status(500).json({
            correcto: false,
            mensaje: 'No se pudieron consultar los estudiantes.',
        });
    }
}

export async function actualizarEdadEstudiante(solicitud, respuesta) {
    const idEstudiante = Number(solicitud.params.idEstudiante);
    const { edad } = solicitud.body;

    if (
        !Number.isSafeInteger(idEstudiante) ||
        idEstudiante < 1
    ) {
        return respuesta.status(400).json({
            correcto: false,
            mensaje: 'El identificador del estudiante no es válido.',
        });
    }

    if (
        !Number.isSafeInteger(edad) ||
        edad < 1 ||
        edad > 65535
    ) {
        return respuesta.status(400).json({
            correcto: false,
            mensaje: 'Escribe una edad válida en años completos.',
        });
    }

    try {
        const [estudiantes] = await baseDatos.execute(
            `SELECT id_estudiante, nombre, edad, nivel
             FROM estudiantes
             WHERE id_estudiante = ?`,
            [idEstudiante]
        );

        if (estudiantes.length === 0) {
            return respuesta.status(404).json({
                correcto: false,
                mensaje: 'No se encontró al estudiante.',
            });
        }

        await baseDatos.execute(
            `UPDATE estudiantes
             SET edad = ?
             WHERE id_estudiante = ?`,
            [edad, idEstudiante]
        );

        return respuesta.json({
            correcto: true,
            estudiante: {
                ...estudiantes[0],
                edad,
            },
        });
    } catch (error) {
        console.error('Error al actualizar la edad:', error);

        return respuesta.status(500).json({
            correcto: false,
            mensaje: 'No se pudo actualizar la edad.',
        });
    }
}