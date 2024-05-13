import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import UnoCSS from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import preact from '@preact/preset-vite';
import yaml from '@rollup/plugin-yaml';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env': env,
    },
    resolve: {
      alias: {
        '@shared': resolve(__dirname, '../shared'),
        '@server': resolve(__dirname, '../server'),
      },
    },
    server: {
      port: 5174,
    },
    appType: 'mpa',
    plugins: [
      yaml(),
      preact(),
      UnoCSS({ configFile: resolve(__dirname, '../uno.config.ts') }),
      Icons({ compiler: 'jsx' }),
    ],
    root: resolve(__dirname),
    base: '/templates',
    build: {
      outDir: resolve(__dirname, '../dist/templates'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          pub: resolve(__dirname, 'index.html'),
          editor: resolve(__dirname, 'editor.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
      },
    },
  };
});
