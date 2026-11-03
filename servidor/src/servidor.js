import aplicacion from './aplicacion.js';

const puerto = Number(process.env.PORT || 3001);

aplicacion.listen(puerto, '0.0.0.0', () => {
    console.log(
        `Servidor iniciado en http://localhost:${puerto}`
    );
});