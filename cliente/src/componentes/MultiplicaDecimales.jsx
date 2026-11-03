import { useRef, useState } from 'react';
import { registrarResultado } from '../servicios/api.js';

// Cada número se expresa en décimas: 12 representa 1.2.
// El producto de dos décimas produce centésimas: 12 × 5 representa 0.60.
const banco = [
  [12, 5], [15, 20], [23, 3], [8, 4],
  [25, 12], [32, 2], [14, 15], [6, 25],
  [45, 2], [35, 4], [75, 8], [12, 12],
];

const TOTAL_PREGUNTAS = 10;

function mezclar(lista) {
  const copia = [...lista];
  for (let indice = copia.length - 1; indice > 0; indice -= 1) {
    const elegido = Math.floor(Math.random() * (indice + 1));
    [copia[indice], copia[elegido]] = [copia[elegido], copia[indice]];
  }
  return copia;
}

function mostrarFactor(decimas) {
  return (decimas / 10).toString();
}

function mostrarResultado(centesimas) {
  return (centesimas / 100).toFixed(2).replace(/0$/, '').replace(/\.$/, '');
}

function crearPartida() {
  return mezclar(banco).slice(0, TOTAL_PREGUNTAS).map(([a, b]) => {
    const correcta = a * b;
    const incorrectas = mezclar(
      [correcta - 20, correcta - 10, correcta + 10, correcta + 20, correcta + 50]
        .filter((opcion) => opcion > 0),
    ).slice(0, 3);

    return { a, b, correcta, opciones: mezclar([correcta, ...incorrectas]) };
  });
}

export default function MultiplicaDecimales({
  idEstudiante,
  idActividad,
  alGuardarResultado,
}) {
  const [preguntas, cambiarPreguntas] = useState(crearPartida);
  const [indice, cambiarIndice] = useState(0);
  const [aciertos, cambiarAciertos] = useState(0);
  const [respuestaElegida, cambiarRespuestaElegida] = useState(null);
  const [guardando, cambiarGuardando] = useState(false);
  const [errorGuardado, cambiarErrorGuardado] = useState('');
  const [resultadoGuardado, cambiarResultadoGuardado] = useState(null);
  const envioEnCurso = useRef(false);

  const terminada = indice === preguntas.length;
  const pregunta = preguntas[indice];

  function responder(opcion) {
    if (respuestaElegida !== null) return;
    cambiarRespuestaElegida(opcion);
    if (opcion === pregunta.correcta) cambiarAciertos((actual) => actual + 1);
  }

  function siguientePregunta() {
    cambiarRespuestaElegida(null);
    cambiarIndice((actual) => actual + 1);
  }

  async function guardarYVerResultado() {
    if (envioEnCurso.current || resultadoGuardado !== null) return;
    envioEnCurso.current = true;
    cambiarGuardando(true);
    cambiarErrorGuardado('');

    try {
      const guardado = await registrarResultado({
        id_estudiante: idEstudiante,
        id_actividad: idActividad,
        aciertos,
        total_preguntas: preguntas.length,
      });
      cambiarResultadoGuardado(guardado);
      cambiarIndice(preguntas.length);
      alGuardarResultado?.();
    } catch (error) {
      cambiarErrorGuardado(error.message || 'No se pudo guardar el resultado.');
    } finally {
      envioEnCurso.current = false;
      cambiarGuardando(false);
    }
  }

  function reiniciar() {
    cambiarPreguntas(crearPartida());
    cambiarIndice(0);
    cambiarAciertos(0);
    cambiarRespuestaElegida(null);
    cambiarResultadoGuardado(null);
    cambiarErrorGuardado('');
  }

  if (terminada) {
    return (
      <div className="tarjeta-actividad">
        <h2>¡Terminaste!</h2>
        <p>Respuestas correctas: {aciertos} de {preguntas.length}.</p>
        <p>
          Puntaje: {resultadoGuardado.puntaje} de 100. Resultado guardado con ID{' '}
          {resultadoGuardado.id_resultado}.
        </p>
        <button type="button" className="boton-principal" onClick={reiniciar}>
          Jugar otra vez
        </button>
      </div>
    );
  }

  return (
    <div className="tarjeta-actividad">
      <h2>Multiplicación de decimales</h2>
      <p>Pregunta {indice + 1} de {preguntas.length} · Aciertos: {aciertos}</p>
      <p>Multiplica los números y selecciona el resultado.</p>

      <div className="operacion-juego" aria-label={`${mostrarFactor(pregunta.a)} por ${mostrarFactor(pregunta.b)}`}>
        <span aria-hidden="true">
          {mostrarFactor(pregunta.a)} × {mostrarFactor(pregunta.b)} = ?
        </span>
      </div>

      <div className="opciones-juego" role="group" aria-label="Opciones de respuesta">
        {pregunta.opciones.map((opcion) => (
          <button
            type="button"
            key={opcion}
            className="boton-secundario"
            disabled={respuestaElegida !== null}
            onClick={() => responder(opcion)}
          >
            {mostrarResultado(opcion)}
          </button>
        ))}
      </div>

      {respuestaElegida !== null && (
        <>
          <p className="retroalimentacion-juego" role="status">
            {respuestaElegida === pregunta.correcta
              ? '¡Correcto!'
              : `La respuesta correcta es ${mostrarResultado(pregunta.correcta)}.`}
          </p>
          {errorGuardado && <p className="error-formulario" role="alert">{errorGuardado}</p>}
          <button
            type="button"
            className="boton-principal"
            disabled={guardando}
            onClick={indice === preguntas.length - 1 ? guardarYVerResultado : siguientePregunta}
          >
            {guardando
              ? 'Guardando…'
              : indice === preguntas.length - 1
                ? errorGuardado ? 'Reintentar guardado' : 'Guardar y ver resultado'
                : 'Siguiente pregunta'}
          </button>
        </>
      )}
    </div>
  );
}
