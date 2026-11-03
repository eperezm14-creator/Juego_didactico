import { useEffect, useState } from 'react';
import { consultarActividades } from '../servicios/api.js';
import UbicaLosJuguetes from './UbicaLosJuguetes.jsx';
import ReconoceFiguras from './ReconoceFiguras.jsx';
import MemoriaSimbolos from './MemoriaSimbolos.jsx';
import TablasMultiplicar from './TablasMultiplicar.jsx';
import SumaFracciones from './SumaFracciones.jsx';
import MultiplicaDecimales from './MultiplicaDecimales.jsx';

const componentesJugables = {
  ubicacion_juguetes: UbicaLosJuguetes,
  reconocer_figuras: ReconoceFiguras,
  memoria_simbolos: MemoriaSimbolos,
  tablas_multiplicar: TablasMultiplicar,
  sumar_fracciones: SumaFracciones,
  multiplicar_decimales: MultiplicaDecimales,
};

export default function CatalogoActividades({
  nivel,
  idEstudiante,
  alGuardarResultado,
  alCambiarActividad,
  alSalirJuego,
}) {
  const [actividades, cambiarActividades] = useState([]);
  const [estado, cambiarEstado] = useState('cargando');
  const [actividadAbierta, cambiarActividadAbierta] = useState(null);

  useEffect(() => {
    let vigente = true;
    cambiarActividadAbierta(null);

    async function cargarActividades() {
      cambiarEstado('cargando');
      try {
        const lista = await consultarActividades();
        if (vigente) {
          cambiarActividades(lista.filter((actividad) => actividad.nivel === nivel));
          cambiarEstado('listo');
        }
      } catch {
        if (vigente) cambiarEstado('error');
      }
    }

    cargarActividades();
    return () => { vigente = false; };
  }, [nivel]);

  function abrirActividad(actividad) {
    cambiarActividadAbierta(actividad);
    alCambiarActividad?.(true);
    window.scrollTo(0, 0);
  }

  function salirAlInicio() {
    cambiarActividadAbierta(null);
    alCambiarActividad?.(false);
    alSalirJuego?.();
    window.scrollTo(0, 0);
  }

  if (actividadAbierta) {
    const Juego = componentesJugables[actividadAbierta.codigo];
    return (
      <section className="catalogo-actividades" aria-label={`Juego: ${actividadAbierta.nombre}`}>
        <button
          type="button"
          className="boton-secundario"
          onClick={salirAlInicio}
        >
          Salir al inicio
        </button>
        {Juego && (
          <Juego
            idEstudiante={idEstudiante}
            idActividad={actividadAbierta.id_actividad}
            alGuardarResultado={alGuardarResultado}
          />
        )}
      </section>
    );
  }

  return (
    <section className="catalogo-actividades" aria-labelledby="titulo-actividades">
      <h2 id="titulo-actividades">Actividades de {nivel}</h2>

      {estado === 'cargando' && <p role="status">Cargando actividades…</p>}
      {estado === 'error' && (
        <p role="alert">
          No se pudieron cargar las actividades. Comprueba la conexión con el servidor.
        </p>
      )}
      {estado === 'listo' && actividades.length === 0 && (
        <p>No hay actividades disponibles para este nivel.</p>
      )}
      {estado === 'listo' && (
        <div className="lista-actividades">
          {actividades.map((actividad) => (
            <article className="tarjeta-actividad" key={actividad.id_actividad}>
              <h3>{actividad.nombre}</h3>
              <p>{actividad.instrucciones}</p>
              {Object.hasOwn(componentesJugables, actividad.codigo) && (
                <button
                  type="button"
                  className="boton-principal"
                  onClick={() => abrirActividad(actividad)}
                >
                  Jugar
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
