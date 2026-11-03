import baseDatos from '../configuracion/baseDatos.js';

export async function listarActividades(solicitud, respuesta) {
  try {
    const [actividades] = await baseDatos.execute(`
      SELECT id_actividad, codigo, nombre, nivel, categoria, instrucciones
      FROM actividades
      WHERE activa = 1
      ORDER BY nivel, id_actividad
    `);

    respuesta.json({
      correcto: true,
      actividades
    });
  } catch (error) {
    console.error('Error al consultar actividades:', error);

    respuesta.status(500).json({
      correcto: false,
      mensaje: 'No fue posible consultar las actividades.'
    });
  }
}