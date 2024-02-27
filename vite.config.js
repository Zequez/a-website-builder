import { defineConfig } from 'vite';

export default defineConfig({
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
