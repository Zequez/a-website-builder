import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';

export default defineConfig({
  plugins: [UnoCSS()],
  root: './app',
  base: './',
  build: {
    outDir: '../app_dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: './app/index.html',
      },
    },
  },
});
