import { useEffect, useState } from 'react';
import { consultarResultados } from '../servicios/api.js';

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  timeZone: 'America/Guatemala',
  dateStyle: 'medium',
  timeStyle: 'short',
});

function mostrarFecha(valor) {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? 'Fecha no disponible' : formatoFecha.format(fecha);
}

function mostrarProgreso(resultado) {
  return resultado.actividad === 'Memoria de símbolos de Guatemala'
    ? `${resultado.aciertos} parejas en ${resultado.total_preguntas} intentos`
    : `${resultado.aciertos} de ${resultado.total_preguntas} aciertos`;
}

export default function HistorialResultados({ idEstudiante, actualizacion }) {
  const [resultados, cambiarResultados] = useState([]);
  const [estado, cambiarEstado] = useState('cargando');
  const [error, cambiarError] = useState('');

  useEffect(() => {
    let vigente = true;

    async function cargarHistorial() {
      cambiarEstado('cargando');
      cambiarError('');
      try {
        const lista = await consultarResultados(idEstudiante);
        if (vigente) {
          cambiarResultados(lista);
          cambiarEstado('listo');
        }
      } catch (errorDeConsulta) {
        if (vigente) {
          cambiarError(errorDeConsulta.message || 'No se pudo cargar el historial.');
          cambiarEstado('error');
        }
      }
    }

    cargarHistorial();
    return () => { vigente = false; };
  }, [idEstudiante, actualizacion]);

  return (
    <section className="reporte-docente" aria-labelledby="titulo-historial">
      <div className="reporte-docente__encabezado">
        <h2 id="titulo-historial">Historial de resultados</h2>
        {estado === 'listo' && (
          <p>{resultados.length} {resultados.length === 1 ? 'partida registrada' : 'partidas registradas'}</p>
        )}
      </div>

      {estado === 'cargando' && <p role="status">Cargando historial…</p>}
      {estado === 'error' && <p className="error-formulario" role="alert">{error}</p>}
      {estado === 'listo' && resultados.length === 0 && (
        <p>Este estudiante aún no ha completado actividades.</p>
      )}

      {estado === 'listo' && resultados.length > 0 && (
        <div className="tabla-resultados__contenedor" role="region" aria-label="Tabla de resultados; desplaza horizontalmente en pantallas pequeñas" tabIndex={0}>
          <table className="tabla-resultados">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Actividad</th>
                <th scope="col">Progreso</th>
                <th scope="col">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((resultado) => (
                <tr key={resultado.id_resultado}>
                  <td>
                    <time dateTime={resultado.fecha_finalizacion}>
                      {mostrarFecha(resultado.fecha_finalizacion)}
                    </time>
                  </td>
                  <th scope="row">{resultado.actividad}</th>
                  <td>{mostrarProgreso(resultado)}</td>
                  <td><strong>{resultado.puntaje}</strong> / 100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
