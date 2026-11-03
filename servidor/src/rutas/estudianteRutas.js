import { Router } from 'express';
import {
    registrarEstudiante,
    listarEstudiantes,
    actualizarEdadEstudiante,
} from '../controladores/estudianteControlador.js';

const rutasEstudiantes = Router();

rutasEstudiantes.get('/estudiantes', listarEstudiantes);
rutasEstudiantes.post('/estudiantes', registrarEstudiante);
rutasEstudiantes.patch(
    '/estudiantes/:idEstudiante',
    actualizarEdadEstudiante
);

export default rutasEstudiantes;