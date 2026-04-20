import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            // Definimos los puntos de entrada para CSS y JS
            input: [
                'resources/css/app.css', 
                'resources/js/app.jsx'
            ],
            refresh: true,
        }),
        react(), // Activamos el soporte para componentes de React
    ],
    resolve: {
        alias: {
            // Esto te ayudará a importar componentes más fácilmente luego
            '@': '/resources/js',
        },
    },
});