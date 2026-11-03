import { useEffect, useRef, useState } from 'react';
import { registrarResultado } from '../servicios/api.js';

const simbolos = [
    {
        clave: 'tecun',
        nombre: 'Tecún Umán',
        imagen: `/imagenes/${encodeURIComponent('Tecún Uman.jpg')}`,
    },
    {
        clave: 'escudo',
        nombre: 'Escudo',
        imagen: `/imagenes/${encodeURIComponent('El Escudo.jpg')}`,
    },
    {
        clave: 'quetzal',
        nombre: 'Quetzal',
        imagen: `/imagenes/${encodeURIComponent('El Quetzal.jpg')}`,
    },
    {
        clave: 'bandera',
        nombre: 'Bandera',
        imagen: `/imagenes/${encodeURIComponent('La Bandera.jpg')}`,
    },
    {
        clave: 'ceiba',
        nombre: 'Ceiba',
        imagen: `/imagenes/${encodeURIComponent('La Ceiba.jpg')}`,
    },
    {
        clave: 'marimba',
        nombre: 'Marimba',
        imagen: `/imagenes/${encodeURIComponent('La Marimba.jpg')}`,
    },
    {
        clave: 'monja',
        nombre: 'Monja Blanca',
        imagen: `/imagenes/${encodeURIComponent('La Monja Blanca.jpg')}`,
    },
];

const cantidadParejas = 4;

function mezclar(elementos) {
    const copia = [...elementos];

    for (let indice = copia.length - 1; indice > 0; indice--) {
        const aleatorio = Math.floor(Math.random() * (indice + 1));
        [copia[indice], copia[aleatorio]] = [
            copia[aleatorio],
            copia[indice],
        ];
    }

    return copia;
}

function crearTablero() {
    const elegidos = mezclar(simbolos).slice(0, cantidadParejas);

    return mezclar(
        elegidos.flatMap((simbolo) => [
            { ...simbolo, idTarjeta: `${simbolo.clave}-1` },
            { ...simbolo, idTarjeta: `${simbolo.clave}-2` },
        ])
    );
}

export default function MemoriaSimbolos({
    idEstudiante,
    idActividad,
    alGuardarResultado,
}) {
    const [tablero, cambiarTablero] = useState(crearTablero);
    const [volteadas, cambiarVolteadas] = useState([]);
    const [encontradas, cambiarEncontradas] = useState([]);
    const [intentos, cambiarIntentos] = useState(0);
    const [aciertos, cambiarAciertos] = useState(0);
    const [guardando, cambiarGuardando] = useState(false);
    const [errorGuardado, cambiarErrorGuardado] = useState('');
    const [resultadoGuardado, cambiarResultadoGuardado] = useState(null);

    const bloqueo = useRef(false);
    const temporizador = useRef(null);

    useEffect(() => {
        return () => {
            if (temporizador.current !== null) {
                clearTimeout(temporizador.current);
            }
        };
    }, []);

    const completo = encontradas.length === cantidadParejas;

    function voltear(indice) {
        const tarjeta = tablero[indice];

        if (
            bloqueo.current ||
            resultadoGuardado ||
            volteadas.includes(indice) ||
            encontradas.includes(tarjeta.clave)
        ) {
            return;
        }

        if (volteadas.length === 0) {
            cambiarVolteadas([indice]);
            return;
        }

        const primera = tablero[volteadas[0]];
        cambiarVolteadas([volteadas[0], indice]);
        cambiarIntentos((actuales) => actuales + 1);

        if (primera.clave === tarjeta.clave) {
            cambiarAciertos((actuales) => actuales + 1);
            cambiarEncontradas((actuales) => [
                ...actuales,
                tarjeta.clave,
            ]);
            cambiarVolteadas([]);
            return;
        }

        bloqueo.current = true;

        temporizador.current = setTimeout(() => {
            cambiarVolteadas([]);
            bloqueo.current = false;
            temporizador.current = null;
        }, 1000);
    }

    async function guardarPartida() {
        if (guardando || resultadoGuardado || !completo) return;

        cambiarGuardando(true);
        cambiarErrorGuardado('');

        try {
            const resultado = await registrarResultado({
                id_estudiante: idEstudiante,
                id_actividad: idActividad,
                aciertos,
                total_preguntas: intentos,
            });

            cambiarResultadoGuardado(resultado);
            alGuardarResultado();
        } catch (error) {
            cambiarErrorGuardado(
                error.message || 'No se pudo guardar la partida.'
            );
        } finally {
            cambiarGuardando(false);
        }
    }

    function reiniciar() {
        if (temporizador.current !== null) {
            clearTimeout(temporizador.current);
            temporizador.current = null;
        }

        bloqueo.current = false;
        cambiarTablero(crearTablero());
        cambiarVolteadas([]);
        cambiarEncontradas([]);
        cambiarIntentos(0);
        cambiarAciertos(0);
        cambiarErrorGuardado('');
        cambiarResultadoGuardado(null);
    }

    return (
        <div className="tarjeta-actividad">
            <h2>Memoria de símbolos de Guatemala</h2>
            <p>
                Voltea dos tarjetas. Si muestran la misma imagen,
                encontrarás una pareja.
            </p>

            <p role="status">
                Parejas encontradas: {encontradas.length} de{' '}
                {cantidadParejas}. Intentos: {intentos}.
            </p>

            <div className="tablero-memoria">
                {tablero.map((tarjeta, indice) => {
                    const visible =
                        volteadas.includes(indice) ||
                        encontradas.includes(tarjeta.clave);

                    return (
                        <button
                            key={tarjeta.idTarjeta}
                            type="button"
                            className={`tarjeta-memoria ${visible ? 'tarjeta-memoria--visible' : ''
                                }`}
                            onClick={() => voltear(indice)}
                            disabled={
                                encontradas.includes(tarjeta.clave) ||
                                resultadoGuardado !== null
                            }
                            aria-label={
                                visible
                                    ? tarjeta.nombre
                                    : `Tarjeta ${indice + 1} oculta`
                            }
                        >
                            {visible ? (
                                <img
                                    src={tarjeta.imagen}
                                    alt={tarjeta.nombre}
                                />
                            ) : (
                                <span aria-hidden="true">?</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {completo && !resultadoGuardado && (
                <>
                    <p>
                        Encontraste las {cantidadParejas} parejas en{' '}
                        {intentos} intentos.
                    </p>

                    {errorGuardado && (
                        <p className="error-formulario" role="alert">
                            {errorGuardado}
                        </p>
                    )}

                    <button
                        type="button"
                        className="boton-principal"
                        onClick={guardarPartida}
                        disabled={guardando}
                    >
                        {guardando
                            ? 'Guardando resultado...'
                            : errorGuardado
                                ? 'Reintentar guardado'
                                : 'Guardar y ver resultado'}
                    </button>
                </>
            )}

            {resultadoGuardado && (
                <>
                    <p role="status">
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
                </>
            )}
        </div>
    );
}