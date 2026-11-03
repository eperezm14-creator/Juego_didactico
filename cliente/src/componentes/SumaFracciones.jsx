import { useRef, useState } from 'react';
import { registrarResultado } from '../servicios/api.js';

const banco = [
  { a: [1, 2], b: [1, 4], opciones: [[3, 4], [2, 6], [1, 4], [1, 2]] },
  { a: [1, 3], b: [1, 3], opciones: [[2, 3], [1, 6], [1, 3], [2, 9]] },
  { a: [2, 5], b: [1, 5], opciones: [[3, 5], [3, 10], [2, 5], [4, 5]] },
  { a: [1, 4], b: [1, 4], opciones: [[1, 2], [2, 8], [1, 4], [3, 4]] },
  { a: [3, 8], b: [1, 8], opciones: [[1, 2], [1, 4], [3, 8], [5, 8]] },
  { a: [2, 3], b: [1, 6], opciones: [[5, 6], [1, 3], [1, 2], [2, 3]] },
  { a: [1, 5], b: [1, 2], opciones: [[7, 10], [2, 7], [3, 10], [3, 5]] },
  { a: [1, 6], b: [1, 3], opciones: [[1, 2], [2, 9], [1, 3], [2, 3]] },
  { a: [3, 4], b: [1, 4], opciones: [[1, 1], [1, 2], [3, 4], [5, 4]] },
  { a: [1, 3], b: [1, 2], opciones: [[5, 6], [2, 5], [1, 2], [2, 3]] },
  { a: [2, 5], b: [2, 5], opciones: [[4, 5], [2, 5], [1, 2], [1, 1]] },
  { a: [3, 10], b: [1, 5], opciones: [[1, 2], [4, 15], [3, 10], [2, 5]] },
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

function crearPartida() {
  return mezclar(banco).slice(0, TOTAL_PREGUNTAS).map((pregunta) => ({
    ...pregunta,
    opciones: mezclar(pregunta.opciones),
  }));
}

function esCorrecta(pregunta, [numerador, denominador]) {
  const [numeradorA, denominadorA] = pregunta.a;
  const [numeradorB, denominadorB] = pregunta.b;
  return (
    numerador * denominadorA * denominadorB ===
    denominador * (numeradorA * denominadorB + numeradorB * denominadorA)
  );
}

function Fraccion({ valor }) {
  const [numerador, denominador] = valor;
  if (denominador === 1) return <span>{numerador}</span>;
  return (
    <span className="fraccion" aria-label={`${numerador} sobre ${denominador}`}>
      <span aria-hidden="true">{numerador}</span>
      <span aria-hidden="true">{denominador}</span>
    </span>
  );
}

export default function SumaFracciones({ idEstudiante, idActividad, alGuardarResultado }) {
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
    if (esCorrecta(pregunta, opcion)) cambiarAciertos((actual) => actual + 1);
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

  const opcionCorrecta = pregunta.opciones.find((opcion) => esCorrecta(pregunta, opcion));

  return (
    <div className="tarjeta-actividad juego-fracciones">
      <h2>Suma de fracciones</h2>
      <p>Pregunta {indice + 1} de {preguntas.length} · Aciertos: {aciertos}</p>
      <p>Suma las fracciones y elige el resultado.</p>

      <div className="operacion-fracciones" aria-label={`${pregunta.a[0]} sobre ${pregunta.a[1]} más ${pregunta.b[0]} sobre ${pregunta.b[1]}`}>
        <span aria-hidden="true"><Fraccion valor={pregunta.a} /></span>
        <span aria-hidden="true">+</span>
        <span aria-hidden="true"><Fraccion valor={pregunta.b} /></span>
        <span aria-hidden="true">=</span>
        <span aria-hidden="true">?</span>
      </div>

      <div className="opciones-juego opciones-fracciones" role="group" aria-label="Opciones de respuesta">
        {pregunta.opciones.map((opcion) => (
          <button
            type="button"
            className="boton-secundario"
            key={`${opcion[0]}/${opcion[1]}`}
            disabled={respuestaElegida !== null}
            onClick={() => responder(opcion)}
            aria-label={`${opcion[0]} sobre ${opcion[1]}`}
          >
            <Fraccion valor={opcion} />
          </button>
        ))}
      </div>

      {respuestaElegida !== null && (
        <>
          <p className="retroalimentacion-juego" role="status">
            {esCorrecta(pregunta, respuestaElegida)
              ? '¡Correcto!'
              : `La respuesta correcta es ${opcionCorrecta[0]}/${opcionCorrecta[1]}.`}
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
