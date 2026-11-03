import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Aplicacion from './Aplicacion.jsx';
import './estilos.css';

// Localiza el elemento que creamos en index.html.
const elementoRaiz = document.getElementById('raiz');

// Muestra la aplicación dentro de ese elemento.
createRoot(elementoRaiz).render(
    <StrictMode>
        <Aplicacion />
    </StrictMode>
);