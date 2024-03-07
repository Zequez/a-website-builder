import { resolve } from 'path';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import elmPlugin from 'vite-plugin-elm';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact(), elmPlugin(), UnoCSS()],
  root: resolve(__dirname, 'app'),
  base: './',
  build: {
    outDir: resolve(__dirname, 'app_dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app/index.html'),
      },
    },
  },
});
