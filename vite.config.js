import { resolve } from 'path';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import elmPlugin from 'vite-plugin-elm';
import preact from '@preact/preset-vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [preact(), elmPlugin(), UnoCSS(), Icons({ compiler: 'jsx' })],
  root: resolve(__dirname, 'app'),
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist', 'app'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app/index.html'),
      },
    },
  },
});
