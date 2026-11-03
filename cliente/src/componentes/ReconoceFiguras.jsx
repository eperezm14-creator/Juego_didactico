import { useState } from 'react';
import { registrarResultado } from '../servicios/api.js';

const preguntas = [
    { figura: 'circulo', respuesta: 'Círculo' },
    { figura: 'cuadrado', respuesta: 'Cuadrado' },
    { figura: 'triangulo', respuesta: 'Triángulo' },
    { figura: 'rectangulo', respuesta: 'Rectángulo' },
];

const opciones = ['Círculo', 'Cuadrado', 'Triángulo', 'Rectángulo'];

export default function ReconoceFiguras({
    idEstudiante,
    idActividad,
    alGuardarResultado,
}) {
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

    async function avanzar() {
        if (guardando || respuestaElegida === null) return;

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
            <h2>Reconoce las figuras</h2>
            <p>Pregunta {indice + 1} de {preguntas.length}</p>
            <p>Observa la figura y selecciona su nombre.</p>

            <div className="escenario-figura">
                <div
                    className={`figura figura--${pregunta.figura}`}
                    role="img"
                    aria-label={pregunta.respuesta}
                />
            </div>

            <div className="opciones-juego">
                {opciones.map((opcion) => (
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
                            : `La figura es un ${pregunta.respuesta.toLowerCase()}.`}
                    </p>

                    {errorGuardado && (
                        <p className="error-formulario" role="alert">
                            {errorGuardado}
                        </p>
                    )}

                    <button
                        type="button"
                        className="boton-principal"
                        onClick={avanzar}
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