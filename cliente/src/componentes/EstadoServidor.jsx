import { useState } from 'react';

import { consultarEstadoServidor } from '../servicios/api.js';

export default function EstadoServidor() {
    const [estado, cambiarEstado] = useState('pendiente');

    const [mensaje, cambiarMensaje] = useState(
        'Todavía no se ha comprobado la conexión.'
    );

    async function comprobarConexion() {
        cambiarEstado('consultando');
        cambiarMensaje('Consultando el servidor…');

        try {
            const datos = await consultarEstadoServidor();

            cambiarEstado('conectado');
            cambiarMensaje(datos.mensaje);
        } catch {
            cambiarEstado('error');

            cambiarMensaje(
                'No fue posible conectar. Revisa que el servidor esté iniciado y que la dirección de la API sea correcta.'
            );
        }
    }

    return (
        <section
            className="comprobacion-servidor"
            aria-labelledby="titulo-conexion"
        >
            <h2 id="titulo-conexion">
                Prueba de conexión con el servidor
            </h2>

            <button
                type="button"
                className="boton-secundario"
                onClick={comprobarConexion}
                disabled={estado === 'consultando'}
            >
                {estado === 'consultando'
                    ? 'Consultando…'
                    : 'Consultar servidor'}
            </button>

            <p
                className={`respuesta-servidor respuesta-servidor--${estado}`}
                role="status"
            >
                {mensaje}
            </p>
        </section>
    );
}