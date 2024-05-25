import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import UnoCSS from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import preact from '@preact/preset-vite';
import yaml from '@rollup/plugin-yaml';
// import treeShakeable from 'rollup-plugin-tree-shakeable';
// import dts from 'vite-plugin-dts';

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
      // dts({ include: ['src'] }),
    ],
    root: resolve(__dirname),
    // base: '/templates',
    build: {
      lib: {
        entry: 'src/public-render.tsx',
        name: 'PublicRender',
        fileName: 'public-render',
        formats: ['es'],
      },
      copyPublicDir: false,
      outDir: resolve(__dirname, '../reactor-dist/renderer'),
      emptyOutDir: true,
      // rollupOptions: {
      //   input: {
      //     renderer: resolve(__dirname, 'src/public-render.tsx'),
      //   },
      // },
    },
  };
});
