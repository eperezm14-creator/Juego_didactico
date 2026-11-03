import { Router } from 'express';

import { consultarEstado } from '../controladores/estadoControlador.js';

const rutasEstado = Router();

// Asocia una consulta GET con su controlador.
rutasEstado.get('/estado', consultarEstado);

export default rutasEstado;