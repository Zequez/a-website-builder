import { resolve } from 'path';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import preact from '@preact/preset-vite';
import Icons from 'unplugin-icons/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  return {
    plugins: [preact(), UnoCSS(), Icons({ compiler: 'jsx' }), tsconfigPaths()],
    root: resolve(__dirname, 'app'),
    base: mode === 'production' ? '/app/' : '/',
    build: {
      outDir: resolve(__dirname, 'dist', 'app'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'app/index.html'),
        },
      },
    },
  };
});
