import { useState } from 'react';
import FormularioEstudiante from './componentes/FormularioEstudiante.jsx';
import SelectorEstudiante from './componentes/SelectorEstudiante.jsx';
import CatalogoActividades from './componentes/CatalogoActividades.jsx';
import HistorialResultados from './componentes/HistorialResultados.jsx';
import EstadoServidor from './componentes/EstadoServidor.jsx';
import { registrarEstudiante, actualizarEdadEstudiante } from './servicios/api.js';

export default function Aplicacion() {
  const [vista, cambiarVista] = useState('juegos');
  const [juegoAbierto, cambiarJuegoAbierto] = useState(false);
  const [nivelSeleccionado, cambiarNivel] = useState('');
  const [estudiante, cambiarEstudiante] = useState(null);
  const [actualizacionHistorial, cambiarActualizacionHistorial] = useState(0);
  const [editandoEdad, cambiarEditandoEdad] = useState(false);
  const [edadEditada, cambiarEdadEditada] = useState('');
  const [guardandoEdad, cambiarGuardandoEdad] = useState(false);
  const [errorEdad, cambiarErrorEdad] = useState('');

  function seleccionarEstudiante(datos) {
    cambiarEstudiante(datos);
    cambiarJuegoAbierto(false);
    cambiarEditandoEdad(false);
    cambiarEdadEditada('');
    cambiarErrorEdad('');
  }

  function seleccionarNivel(nivel) {
    if (nivel !== nivelSeleccionado) seleccionarEstudiante(null);
    cambiarNivel(nivel);
  }

  async function continuarConEstudiante(datos) {
    const estudianteRegistrado = await registrarEstudiante({
      ...datos,
      nivel: nivelSeleccionado,
    });
    seleccionarEstudiante(estudianteRegistrado);
  }

  function iniciarEdicionEdad() {
    cambiarEdadEditada(String(estudiante.edad));
    cambiarErrorEdad('');
    cambiarEditandoEdad(true);
  }

  function cancelarEdicionEdad() {
    cambiarEditandoEdad(false);
    cambiarEdadEditada('');
    cambiarErrorEdad('');
  }

  async function guardarEdad(evento) {
    evento.preventDefault();
    const edadNumerica = Number(edadEditada);
    if (
      edadEditada.trim() === '' ||
      !Number.isSafeInteger(edadNumerica) ||
      edadNumerica < 1 ||
      edadNumerica > 65535
    ) {
      cambiarErrorEdad('Escribe una edad válida en años completos.');
      return;
    }

    cambiarGuardandoEdad(true);
    cambiarErrorEdad('');
    try {
      const estudianteActualizado = await actualizarEdadEstudiante(
        estudiante.id_estudiante,
        edadNumerica,
      );
      cambiarEstudiante(estudianteActualizado);
      cancelarEdicionEdad();
    } catch (error) {
      cambiarErrorEdad(error.message || 'No se pudo actualizar la edad.');
    } finally {
      cambiarGuardandoEdad(false);
    }
  }

  const mensaje = nivelSeleccionado
    ? `Seleccionaste el nivel ${nivelSeleccionado}.`
    : 'Selecciona un nivel para comenzar.';

  return (
    <main className={`pagina pagina--${vista}${juegoAbierto ? ' pagina--jugando' : ''}`}>
      <div className="tarjeta-principal">
        {juegoAbierto && estudiante && (
          <header className="cabecera-juego">
            <span className="cabecera-juego__icono" aria-hidden="true">🎲</span>
            <div>
              <p>Está jugando</p>
              <h1>{estudiante.nombre}</h1>
            </div>
          </header>
        )}

        {!juegoAbierto && <header className="cabecera-aplicacion">
          <p className="etiqueta">Aprende jugando</p>
          <h1 id="titulo-principal">
            {vista === 'juegos' ? '¡Vamos a descubrir!' : 'Reporte docente'}
          </h1>
          <p className="descripcion">
            {vista === 'juegos'
              ? 'Explora, piensa y aprende a tu ritmo.'
              : 'Consulta el progreso de cada estudiante y sus actividades.'}
          </p>
          <nav className="navegacion-vistas" aria-label="Vistas de la aplicación">
            <button
              type="button"
              className="navegacion-vistas__boton"
              aria-current={vista === 'juegos' ? 'page' : undefined}
              onClick={() => cambiarVista('juegos')}
            >
              🎲 Juegos
            </button>
            <button
              type="button"
              className="navegacion-vistas__boton"
              aria-current={vista === 'docentes' ? 'page' : undefined}
              onClick={() => cambiarVista('docentes')}
            >
              📊 Reporte docente
            </button>
          </nav>
        </header>}

        {!juegoAbierto && <section className="seleccion-nivel" aria-label="Selección de nivel educativo">
          <h2 className="titulo-seccion">Elige el nivel</h2>
          <div className="niveles" role="group" aria-label="Nivel educativo">
            <button
              type="button"
              className="boton-nivel boton-preprimario"
              aria-pressed={nivelSeleccionado === 'preprimario'}
              onClick={() => seleccionarNivel('preprimario')}
            >
              <span className="icono-nivel" aria-hidden="true">🧸</span>
              <span className="nombre-nivel">Preprimario</span>
              <span className="detalle-nivel">Espacio, figuras y memoria</span>
            </button>
            <button
              type="button"
              className="boton-nivel boton-primario"
              aria-pressed={nivelSeleccionado === 'primario'}
              onClick={() => seleccionarNivel('primario')}
            >
              <span className="icono-nivel" aria-hidden="true">🔢</span>
              <span className="nombre-nivel">Primario</span>
              <span className="detalle-nivel">Multiplicaciones, fracciones y decimales</span>
            </button>
          </div>
          <p className="mensaje" role="status">{mensaje}</p>
        </section>}

        {!juegoAbierto && nivelSeleccionado && !estudiante && (
          <div className="seleccion-estudiante">
            <SelectorEstudiante
              nivel={nivelSeleccionado}
              alSeleccionar={seleccionarEstudiante}
            />
            {vista === 'juegos' && (
              <FormularioEstudiante alContinuar={continuarConEstudiante} />
            )}
          </div>
        )}

        {!juegoAbierto && estudiante && (
          <section className="resumen-estudiante" aria-label="Datos del estudiante">
            <h2>{vista === 'juegos' ? `¡Hola, ${estudiante.nombre}!` : `Estudiante: ${estudiante.nombre}`}</h2>
            <p>Edad: {estudiante.edad} años.</p>
            <p>Nivel seleccionado: {nivelSeleccionado}.</p>

            {vista === 'docentes' && editandoEdad && (
              <form className="formulario-edad" onSubmit={guardarEdad}>
                <div className="campo-formulario">
                  <label htmlFor="edad-editada">Corregir edad en años</label>
                  <input
                    id="edad-editada"
                    type="number"
                    min="1"
                    max="65535"
                    step="1"
                    value={edadEditada}
                    onChange={(evento) => cambiarEdadEditada(evento.target.value)}
                    disabled={guardandoEdad}
                  />
                </div>
                {errorEdad && <p className="error-formulario" role="alert">{errorEdad}</p>}
                <div className="acciones-estudiante">
                  <button type="submit" className="boton-principal" disabled={guardandoEdad}>
                    {guardandoEdad ? 'Guardando…' : 'Guardar edad'}
                  </button>
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={cancelarEdicionEdad}
                    disabled={guardandoEdad}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="acciones-estudiante">
              {vista === 'docentes' && !editandoEdad && (
                <button type="button" className="boton-secundario" onClick={iniciarEdicionEdad}>
                  Editar edad
                </button>
              )}
              <button
                type="button"
                className="boton-secundario"
                onClick={() => seleccionarEstudiante(null)}
                disabled={guardandoEdad}
              >
                Cambiar estudiante
              </button>
            </div>
          </section>
        )}

        {estudiante && (
          <div hidden={vista !== 'juegos'}>
            <CatalogoActividades
              key={estudiante.id_estudiante}
              nivel={nivelSeleccionado}
              idEstudiante={estudiante.id_estudiante}
              alGuardarResultado={() => cambiarActualizacionHistorial((actual) => actual + 1)}
              alCambiarActividad={cambiarJuegoAbierto}
              alSalirJuego={() => seleccionarEstudiante(null)}
            />
          </div>
        )}

        {vista === 'docentes' && (
          <>
            {estudiante ? (
              <HistorialResultados
                key={`historial-${estudiante.id_estudiante}`}
                idEstudiante={estudiante.id_estudiante}
                actualizacion={actualizacionHistorial}
              />
            ) : (
              <p className="aviso-reporte">
                {nivelSeleccionado
                  ? 'Selecciona un estudiante para consultar su historial.'
                  : 'Elige un nivel y selecciona un estudiante para ver el reporte.'}
              </p>
            )}
            <details className="herramientas-desarrollo">
              <summary>Comprobar conexión con el servidor</summary>
              <EstadoServidor />
            </details>
          </>
        )}
      </div>
    </main>
  );
}
