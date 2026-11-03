import { Router } from 'express';
import { listarActividades } from '../controladores/actividadControlador.js';

const rutasActividades = Router();

rutasActividades.get('/actividades', listarActividades);

export default rutasActividades;