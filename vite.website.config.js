import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist-website',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'website.html'),
      },
    },
  },
});
