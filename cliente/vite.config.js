import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    // Habilita la integración de React con Vite.
    plugins: [react()],

    // Genera rutas relativas para los recursos compilados.
    base: './'
});