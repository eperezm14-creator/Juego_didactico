const direccionApi = (
    import.meta.env.VITE_URL_API || ''
).replace(/\/+$/, '');

export async function consultarEstadoServidor() {
    if (!direccionApi) {
        throw new Error('Falta configurar la dirección de la API.');
    }

    const respuesta = await fetch(`${direccionApi}/estado`, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
    });

    if (!respuesta.ok) {
        throw new Error(
            `El servidor respondió con el código ${respuesta.status}.`
        );
    }

    const datos = await respuesta.json();

    if (
        datos.correcto !== true ||
        typeof datos.mensaje !== 'string'
    ) {
        throw new Error(
            'La respuesta del servidor no tiene el formato esperado.'
        );
    }

    return datos;
}

export async function consultarActividades() {
    if (!direccionApi) {
        throw new Error('Falta configurar la dirección de la API.');
    }

    const respuesta = await fetch(`${direccionApi}/actividades`, {
        method: 'GET',
        cache: 'no-store',
    });

    if (!respuesta.ok) {
        throw new Error(
            `El servidor respondió con el código ${respuesta.status}.`
        );
    }

    const datos = await respuesta.json();

    if (
        datos.correcto !== true ||
        !Array.isArray(datos.actividades)
    ) {
        throw new Error(
            'La respuesta de actividades no tiene el formato esperado.'
        );
    }

    return datos.actividades;
}

export async function registrarEstudiante({ nombre, edad, nivel }) {
    const respuesta = await fetch(`${direccionApi}/estudiantes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, edad, nivel }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok || !datos.correcto) {
        throw new Error(
            datos.mensaje || 'No se pudo registrar al estudiante.'
        );
    }

    return datos.estudiante;
}

export async function consultarEstudiantes(nivel) {
    const respuesta = await fetch(
        `${direccionApi}/estudiantes?nivel=${encodeURIComponent(nivel)}`
    );

    const datos = await respuesta.json();

    if (!respuesta.ok || !datos.correcto) {
        throw new Error(
            datos.mensaje || 'No se pudieron cargar los estudiantes.'
        );
    }

    return datos.estudiantes;
}

export async function actualizarEdadEstudiante(idEstudiante, edad) {
    const respuesta = await fetch(
        `${direccionApi}/estudiantes/${encodeURIComponent(idEstudiante)}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ edad }),
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok || !datos.correcto) {
        throw new Error(
            datos.mensaje || 'No se pudo actualizar la edad.'
        );
    }

    return datos.estudiante;
}

export async function registrarResultado(resultado) {
    const respuesta = await fetch(`${direccionApi}/resultados`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultado),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok || !datos.correcto) {
        throw new Error(
            datos.mensaje || 'No se pudo guardar el resultado.'
        );
    }

    return datos.resultado;
}

export async function consultarResultados(idEstudiante) {
    const respuesta = await fetch(
        `${direccionApi}/resultados?id_estudiante=${encodeURIComponent(idEstudiante)}`
    );

    const datos = await respuesta.json();

    if (!respuesta.ok || !datos.correcto) {
        throw new Error(
            datos.mensaje || 'No se pudo cargar el historial.'
        );
    }

    return datos.resultados;
}