import { resolve } from 'path';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import createReScriptPlugin from '@jihchi/vite-plugin-rescript';
import elmPlugin from 'vite-plugin-elm';

export default defineConfig({
  plugins: [
    elmPlugin(),
    createReScriptPlugin({
      loader: {
        output: './lib/es6/app',
        suffix: '.res.js',
      },
    }),
    UnoCSS(),
  ],
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
