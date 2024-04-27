import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import UnoCSS from 'unocss/vite';
import preact from '@preact/preset-vite';
import Icons from 'unplugin-icons/vite';
import vike from 'vike/plugin';
import babel from '@babel/core';
import solidPlugin from 'vite-plugin-solid';

const projectRootDir = resolve(__dirname);

const solidFiles = [/PowerFlow\.tsx/, /PledgeCard\.tsx/, /PowerFlow\.story\.tsx/];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    resolve: {
      alias: {
        '@app': resolve(__dirname, 'app'),
        '@server': resolve(__dirname, 'server'),
        '@db': resolve(__dirname, 'server/db'),
        '@shared': resolve(__dirname, 'shared'),
        '@ipreact': resolve(__dirname, 'independent-preact/bundle.js'),
      },
    },
    server: {
      port: 5173,
    },
    appType: 'mpa',
    plugins: [
      solidPlugin({ include: solidFiles }),
      vike({ prerender: true }),
      preact({ exclude: solidFiles }),
      UnoCSS(),
      Icons({ compiler: 'jsx' }),
      // tsconfigPaths(),
    ],
    optimizeDeps: {
      include: [
        'preact',
        'preact/devtools',
        'preact/debug',
        'preact/jsx-dev-runtime',
        'preact/hooks',
      ],
    },
    define: {
      GOOGLE_CLIENT_ID: JSON.stringify(env.GOOGLE_CLIENT_ID),
      GOOGLE_API_KEY: JSON.stringify(env.GOOGLE_API_KEY),
    },
    root: resolve(__dirname, 'app'),
    base: '/', //mode === 'production' ? '/app/' : '/',
    build: {
      outDir: resolve(__dirname, 'dist/vike'), //, 'app'),
      emptyOutDir: true,
      rollupOptions: {
        // input: {
        //   main: resolve(__dirname, 'app/index.html'),
        //   editor: resolve(__dirname, 'app/editor/index.html'),
        //   join: resolve(__dirname, 'app/index.html'),
        // },
        // output: {
        //   assetFileNames: '_app_assets_/[name]-[hash][extname]',
        //   chunkFileNames: '_app_assets_/[name]-[hash].js',
        //   entryFileNames: '_app_assets_/[name]-[hash].js',
        // },
      },
    },
  };
});
