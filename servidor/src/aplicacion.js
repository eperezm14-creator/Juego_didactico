import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import rutasEstado from './rutas/estadoRutas.js';
import rutasActividades from './rutas/actividadRutas.js';
import rutasEstudiantes from './rutas/estudianteRutas.js';
import rutasResultados from './rutas/resultadoRutas.js';

const aplicacion = express();

// Configura el origen que puede leer respuestas desde el navegador.
aplicacion.use(cors({
    origin: process.env.ORIGEN_CLIENTE || 'http://localhost:5173'
}));

// Permite recibir cuerpos de solicitudes en formato JSON.
aplicacion.use(express.json({
    limit: '10kb'
}));

// Todas las rutas de este grupo comenzarán con /api.
aplicacion.use('/api', rutasEstado);
aplicacion.use('/api', rutasActividades);
aplicacion.use('/api', rutasEstudiantes);
aplicacion.use('/api', rutasResultados);
// Responde cuando la dirección solicitada no está definida.
aplicacion.use((solicitud, respuesta) => {
    
    respuesta.status(404).json({
        correcto: false,
        mensaje: 'La ruta solicitada no existe.'
    });
});

export default aplicacion;