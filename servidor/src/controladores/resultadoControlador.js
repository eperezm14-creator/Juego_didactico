import baseDatos from '../configuracion/baseDatos.js';

export async function registrarResultado(solicitud, respuesta) {
    const {
        id_estudiante,
        id_actividad,
        aciertos,
        total_preguntas,
    } = solicitud.body;

    if (
        !Number.isSafeInteger(id_estudiante) ||
        id_estudiante < 1 ||
        !Number.isSafeInteger(id_actividad) ||
        id_actividad < 1 ||
        !Number.isSafeInteger(aciertos) ||
        aciertos < 0 ||
        !Number.isSafeInteger(total_preguntas) ||
        total_preguntas < 1 ||
        aciertos > total_preguntas
    ) {
        return respuesta.status(400).json({
            correcto: false,
            mensaje: 'Los datos del resultado no son válidos.',
        });
    }

    try {
        const [actividades] = await baseDatos.execute(
            `SELECT a.id_actividad
             FROM actividades AS a
             INNER JOIN estudiantes AS e
                 ON e.nivel = a.nivel
             WHERE a.id_actividad = ?
               AND e.id_estudiante = ?
               AND a.activa = 1`,
            [id_actividad, id_estudiante]
        );

        if (actividades.length === 0) {
            return respuesta.status(400).json({
                correcto: false,
                mensaje: 'El estudiante o la actividad no corresponden al nivel seleccionado.',
            });
        }

        const puntaje = Math.round(
            (aciertos / total_preguntas) * 100
        );

        const [insercion] = await baseDatos.execute(
            `INSERT INTO resultados
                (id_estudiante, id_actividad, aciertos, total_preguntas, puntaje)
             VALUES (?, ?, ?, ?, ?)`,
            [
                id_estudiante,
                id_actividad,
                aciertos,
                total_preguntas,
                puntaje,
            ]
        );

        return respuesta.status(201).json({
            correcto: true,
            resultado: {
                id_resultado: insercion.insertId,
                id_estudiante,
                id_actividad,
                aciertos,
                total_preguntas,
                puntaje,
            },
        });
    } catch (error) {
        console.error('Error al registrar resultado:', error);

        return respuesta.status(500).json({
            correcto: false,
            mensaje: 'No se pudo guardar el resultado.',
        });
    }
}
export async function listarResultados(solicitud, respuesta) {
    const idEstudiante = Number(solicitud.query.id_estudiante);

    if (!Number.isSafeInteger(idEstudiante) || idEstudiante < 1) {
        return respuesta.status(400).json({
            correcto: false,
            mensaje: 'Indica un estudiante válido.',
        });
    }

    try {
        const [resultados] = await baseDatos.execute(
            `SELECT
                r.id_resultado,
                r.id_estudiante,
                r.id_actividad,
                a.nombre AS actividad,
                r.aciertos,
                r.total_preguntas,
                r.puntaje,
                r.fecha_finalizacion
             FROM resultados AS r
             INNER JOIN actividades AS a
                 ON a.id_actividad = r.id_actividad
             WHERE r.id_estudiante = ?
             ORDER BY r.fecha_finalizacion DESC, r.id_resultado DESC`,
            [idEstudiante]
        );

        return respuesta.json({
            correcto: true,
            resultados,
        });
    } catch (error) {
        console.error('Error al consultar resultados:', error);

        return respuesta.status(500).json({
            correcto: false,
            mensaje: 'No se pudo consultar el historial.',
        });
    }
}