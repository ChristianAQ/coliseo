import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // Cambia '/coliseo/' por '/<nombre-de-tu-repo>/'.
  // Si vas a publicar en <usuario>.github.io (repo raíz) o con dominio propio, usa '/'.
  base: process.env.NODE_ENV === 'production' ? '/coliseo/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
