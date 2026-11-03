import { useEffect, useState } from 'react';
import { consultarEstudiantes } from '../servicios/api.js';

export default function SelectorEstudiante({ nivel, alSeleccionar }) {
    const [estudiantes, cambiarEstudiantes] = useState([]);
    const [idSeleccionado, cambiarIdSeleccionado] = useState('');
    const [cargando, cambiarCargando] = useState(true);
    const [error, cambiarError] = useState('');

    useEffect(() => {
        let vigente = true;

        async function cargarEstudiantes() {
            cambiarCargando(true);
            cambiarError('');
            cambiarIdSeleccionado('');

            try {
                const lista = await consultarEstudiantes(nivel);

                if (vigente) {
                    cambiarEstudiantes(lista);
                }
            } catch (errorDeConsulta) {
                if (vigente) {
                    cambiarError(errorDeConsulta.message);
                }
            } finally {
                if (vigente) {
                    cambiarCargando(false);
                }
            }
        }

        cargarEstudiantes();

        return () => {
            vigente = false;
        };
    }, [nivel]);

    function seleccionarEstudiante() {
        const elegido = estudiantes.find(
            (estudiante) =>
                estudiante.id_estudiante === Number(idSeleccionado)
        );

        if (elegido) {
            alSeleccionar(elegido);
        }
    }

    return (
        <section
            className="formulario-estudiante"
            aria-label="Estudiantes registrados"
        >
            <h2>¿Ya tienes un registro?</h2>

            {cargando && <p>Cargando estudiantes...</p>}

            {error && (
                <p className="error-formulario" role="alert">
                    {error}
                </p>
            )}

            {!cargando && !error && estudiantes.length === 0 && (
                <p>Aún no hay estudiantes registrados en este nivel.</p>
            )}

            {!cargando && !error && estudiantes.length > 0 && (
                <>
                    <div className="campo-formulario">
                        <label htmlFor="estudiante-registrado">
                            Selecciona tu registro
                        </label>

                        <select
                            id="estudiante-registrado"
                            value={idSeleccionado}
                            onChange={(evento) =>
                                cambiarIdSeleccionado(evento.target.value)
                            }
                        >
                            <option value="">Elige un estudiante</option>

                            {estudiantes.map((estudiante) => (
                                <option
                                    key={estudiante.id_estudiante}
                                    value={estudiante.id_estudiante}
                                >
                                    {estudiante.nombre} · {estudiante.edad} años · ID {estudiante.id_estudiante}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        className="boton-principal"
                        onClick={seleccionarEstudiante}
                        disabled={!idSeleccionado}
                    >
                        Continuar con este estudiante
                    </button>
                </>
            )}
        </section>
    );
}