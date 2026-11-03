import { useState } from 'react';
import { registrarResultado } from '../servicios/api.js';

const cantidadPreguntas = 10;

function crearPreguntas() {
    const operaciones = [];

    for (let primerNumero = 2; primerNumero <= 9; primerNumero++) {
        for (let segundoNumero = 2; segundoNumero <= 9; segundoNumero++) {
            operaciones.push({
                primerNumero,
                segundoNumero,
                respuesta: primerNumero * segundoNumero,
            });
        }
    }

    for (let indice = operaciones.length - 1; indice > 0; indice--) {
        const aleatorio = Math.floor(Math.random() * (indice + 1));
        [operaciones[indice], operaciones[aleatorio]] = [
            operaciones[aleatorio],
            operaciones[indice],
        ];
    }

    return operaciones.slice(0, cantidadPreguntas);
}

export default function TablasMultiplicar({
    idEstudiante,
    idActividad,
    alGuardarResultado,
}) {
    const [preguntas, cambiarPreguntas] = useState(crearPreguntas);
    const [indice, cambiarIndice] = useState(0);
    const [respuesta, cambiarRespuesta] = useState('');
    const [respuestaEvaluada, cambiarRespuestaEvaluada] = useState(null);
    const [aciertos, cambiarAciertos] = useState(0);
    const [error, cambiarError] = useState('');
    const [guardando, cambiarGuardando] = useState(false);
    const [resultadoGuardado, cambiarResultadoGuardado] = useState(null);

    const terminada = indice === preguntas.length;
    const pregunta = preguntas[indice];

    function comprobar(evento) {
        evento.preventDefault();

        if (respuestaEvaluada !== null) return;

        const numero = Number(respuesta);

        if (respuesta.trim() === '' || !Number.isInteger(numero)) {
            cambiarError('Escribe un número entero para responder.');
            return;
        }

        cambiarError('');
        cambiarRespuestaEvaluada(numero);

        if (numero === pregunta.respuesta) {
            cambiarAciertos((actuales) => actuales + 1);
        }
    }

    async function avanzar() {
        if (guardando || respuestaEvaluada === null) return;

        if (indice < preguntas.length - 1) {
            cambiarIndice((actual) => actual + 1);
            cambiarRespuesta('');
            cambiarRespuestaEvaluada(null);
            cambiarError('');
            return;
        }

        cambiarGuardando(true);
        cambiarError('');

        try {
            const resultado = await registrarResultado({
                id_estudiante: idEstudiante,
                id_actividad: idActividad,
                aciertos,
                total_preguntas: preguntas.length,
            });

            cambiarResultadoGuardado(resultado);
            alGuardarResultado();
            cambiarIndice(preguntas.length);
        } catch (errorDeGuardado) {
            cambiarError(
                errorDeGuardado.message ||
                'No se pudo guardar la partida.'
            );
        } finally {
            cambiarGuardando(false);
        }
    }

    function reiniciar() {
        cambiarPreguntas(crearPreguntas());
        cambiarIndice(0);
        cambiarRespuesta('');
        cambiarRespuestaEvaluada(null);
        cambiarAciertos(0);
        cambiarError('');
        cambiarResultadoGuardado(null);
    }

    if (terminada) {
        return (
            <div className="tarjeta-actividad">
                <h2>¡Terminaste!</h2>
                <p>
                    Respuestas correctas: {aciertos} de {preguntas.length}.
                </p>
                <p>
                    Puntaje: {resultadoGuardado.puntaje} de 100.
                    Resultado guardado con ID{' '}
                    {resultadoGuardado.id_resultado}.
                </p>
                <button
                    type="button"
                    className="boton-principal"
                    onClick={reiniciar}
                >
                    Jugar otra vez
                </button>
            </div>
        );
    }

    return (
        <div className="tarjeta-actividad">
            <h2>Tablas de multiplicar</h2>
            <p>Pregunta {indice + 1} de {preguntas.length}</p>

            <div className="operacion-juego">
                {pregunta.primerNumero} × {pregunta.segundoNumero} = ?
            </div>

            <form onSubmit={comprobar}>
                <div className="campo-formulario">
                    <label htmlFor="respuesta-multiplicacion">
                        Tu respuesta
                    </label>
                    <input
                        id="respuesta-multiplicacion"
                        type="number"
                        step="1"
                        value={respuesta}
                        onChange={(evento) =>
                            cambiarRespuesta(evento.target.value)
                        }
                        disabled={respuestaEvaluada !== null}
                    />
                </div>

                {respuestaEvaluada === null && (
                    <button
                        type="submit"
                        className="boton-principal"
                    >
                        Comprobar
                    </button>
                )}
            </form>

            {respuestaEvaluada !== null && (
                <>
                    <p role="status">
                        {respuestaEvaluada === pregunta.respuesta
                            ? '¡Correcto!'
                            : `La respuesta correcta es ${pregunta.respuesta}.`}
                    </p>

                    <button
                        type="button"
                        className="boton-principal"
                        onClick={avanzar}
                        disabled={guardando}
                    >
                        {guardando
                            ? 'Guardando resultado...'
                            : error && indice === preguntas.length - 1
                              ? 'Reintentar guardado'
                              : indice === preguntas.length - 1
                                ? 'Guardar y ver resultado'
                                : 'Siguiente pregunta'}
                    </button>
                </>
            )}

            {error && (
                <p className="error-formulario" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}