import { useState } from 'react';
import { registrarResultado } from '../servicios/api.js';

const preguntas = [
    {
        objeto: '🧸',
        referencia: 'Caja',
        escena: 'dentro',
        enunciado: 'Observa al oso y la caja. ¿Dónde está el oso?',
        opciones: ['Adentro', 'Afuera'],
        respuesta: 'Adentro',
    },
    {
        objeto: '🚗',
        referencia: 'Estante',
        escena: 'arriba',
        enunciado: 'Observa el carrito y el estante. ¿Dónde está el carrito?',
        opciones: ['Arriba', 'Abajo'],
        respuesta: 'Arriba',
    },
    {
        objeto: '🪁',
        referencia: 'Caja',
        escena: 'lejos',
        enunciado: 'Observa el barrilete y la caja. ¿Dónde está el barrilete?',
        opciones: ['Cerca', 'Lejos'],
        respuesta: 'Lejos',
    },
    {
        objeto: '⚽',
        referencia: 'Mesa',
        escena: 'debajo',
        enunciado: 'Observa la pelota y la mesa. ¿Dónde está la pelota?',
        opciones: ['Encima', 'Debajo'],
        respuesta: 'Debajo',
    },
];

export default function UbicaLosJuguetes({ idEstudiante, idActividad, alGuardarResultado, }) {
    const [indice, cambiarIndice] = useState(0);
    const [aciertos, cambiarAciertos] = useState(0);
    const [respuestaElegida, cambiarRespuestaElegida] = useState(null);
    const [guardando, cambiarGuardando] = useState(false);
    const [errorGuardado, cambiarErrorGuardado] = useState('');
    const [resultadoGuardado, cambiarResultadoGuardado] = useState(null);

    const terminada = indice === preguntas.length;
    const pregunta = preguntas[indice];

    function responder(opcion) {
        if (respuestaElegida !== null) return;

        cambiarRespuestaElegida(opcion);

        if (opcion === pregunta.respuesta) {
            cambiarAciertos((actuales) => actuales + 1);
        }
    }

    async function siguientePregunta() {
        if (guardando) return;

        if (indice < preguntas.length - 1) {
            cambiarRespuestaElegida(null);
            cambiarIndice((actual) => actual + 1);
            return;
        }

        cambiarGuardando(true);
        cambiarErrorGuardado('');

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
        } catch (error) {
            cambiarErrorGuardado(
                error.message || 'No se pudo guardar la partida.'
            );
        } finally {
            cambiarGuardando(false);
        }
    }

    function reiniciar() {
        cambiarIndice(0);
        cambiarAciertos(0);
        cambiarRespuestaElegida(null);
        cambiarGuardando(false);
        cambiarErrorGuardado('');
        cambiarResultadoGuardado(null);
    }

    if (terminada) {
        return (
            <div className="tarjeta-actividad">
                <h2>¡Terminaste!</h2>

                <p>
                    Respuestas correctas: {aciertos} de {preguntas.length}.
                </p>

                {resultadoGuardado && (
                    <p>
                        Puntaje: {resultadoGuardado.puntaje} de 100.
                        Resultado guardado con ID{' '}
                        {resultadoGuardado.id_resultado}.
                    </p>
                )}

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
            <h2>Ubica los juguetes</h2>

            <p>
                Pregunta {indice + 1} de {preguntas.length}
            </p>

            <div
                className={`escena-juguetes escena-juguetes--${pregunta.escena}`}
                role="img"
                aria-label={`Escena con un juguete y un objeto de referencia: ${pregunta.referencia}`}
            >
                <div className="escena-juguetes__referencia">
                    <span>{pregunta.referencia}</span>
                </div>

                <span className="escena-juguetes__objeto">
                    {pregunta.objeto}
                </span>
            </div>

            <h3>{pregunta.enunciado}</h3>

            <div className="opciones-juego">
                {pregunta.opciones.map((opcion) => (
                    <button
                        key={opcion}
                        type="button"
                        className="boton-secundario"
                        disabled={respuestaElegida !== null}
                        onClick={() => responder(opcion)}
                    >
                        {opcion}
                    </button>
                ))}
            </div>

            {respuestaElegida !== null && (
                <>
                    <p role="status">
                        {respuestaElegida === pregunta.respuesta
                            ? '¡Correcto!'
                            : `La respuesta correcta es ${pregunta.respuesta}.`}
                    </p>

                    {errorGuardado && (
                        <p className="error-formulario" role="alert">
                            {errorGuardado}
                        </p>
                    )}

                    <button
                        type="button"
                        className="boton-principal"
                        onClick={siguientePregunta}
                        disabled={guardando}
                    >
                        {guardando
                            ? 'Guardando resultado...'
                            : errorGuardado
                                ? 'Reintentar guardado'
                                : indice === preguntas.length - 1
                                    ? 'Guardar y ver resultado'
                                    : 'Siguiente pregunta'}
                    </button>
                </>
            )}
        </div>
    );
}