import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Für GitHub Pages (Projekt-Site) muss der Build unter /callsheet/ laufen.
// Im Dev-Server bleibt der Base-Pfad "/". Per VITE_BASE überschreibbar.
export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE ?? (command === 'build' ? '/callsheet/' : '/'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
