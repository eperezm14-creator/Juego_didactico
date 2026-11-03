import { Router } from 'express';
import {
    registrarResultado,
    listarResultados,
} from '../controladores/resultadoControlador.js';

const rutasResultados = Router();

rutasResultados.get('/resultados', listarResultados);
rutasResultados.post('/resultados', registrarResultado);

export default rutasResultados;