import { useState } from 'react';

export default function FormularioEstudiante({ alContinuar }) {
    const [nombre, cambiarNombre] = useState('');
    const [edad, cambiarEdad] = useState('');
    const [error, cambiarError] = useState('');

    function procesarFormulario(evento) {
        // Evita que el formulario recargue la página.
        evento.preventDefault();

        // Limpia los espacios sobrantes del nombre.
        const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');
        const edadNumerica = Number(edad);

        if (nombreLimpio === '') {
            cambiarError('Escribe el nombre del estudiante.');
            return;
        }

        if (
            !Number.isSafeInteger(edadNumerica) ||
            edadNumerica <= 0
        ) {
            cambiarError('Escribe una edad válida en años completos.');
            return;
        }

        cambiarError('');

        // Entrega los datos validados al componente Aplicacion.
        alContinuar({
            nombre: nombreLimpio,
            edad: edadNumerica
        });
    }

    return (
        <form
            className="formulario-estudiante"
            onSubmit={procesarFormulario}
            noValidate
        >
            <h2>¿Quién va a aprender hoy?</h2>

            <div className="campo-formulario">
                <label htmlFor="nombre-estudiante">
                    Nombre del estudiante
                </label>

                <input
                    id="nombre-estudiante"
                    name="nombre"
                    type="text"
                    placeholder="Escribe tu nombre"
                    value={nombre}
                    onChange={(evento) => cambiarNombre(evento.target.value)}
                    required
                />
            </div>

            <div className="campo-formulario">
                <label htmlFor="edad-estudiante">
                    Edad en años
                </label>

                <input
                    id="edad-estudiante"
                    name="edad"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Escribe tu edad"
                    value={edad}
                    onChange={(evento) => cambiarEdad(evento.target.value)}
                    required
                />
            </div>

            {error && (
                <p className="error-formulario" role="alert">
                    {error}
                </p>
            )}

            <button type="submit" className="boton-principal">
                Continuar
            </button>
        </form>
    );
}