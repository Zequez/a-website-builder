import { resolve } from 'path';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import preact from '@preact/preset-vite';
import Icons from 'unplugin-icons/vite';
import vike from 'vike/plugin';
import babel from '@babel/core';
import solidPlugin from 'vite-plugin-solid';

const projectRootDir = resolve(__dirname);

const fileRegex = /PowerFlow\.tsx$/;

function transformSolidJsPlugin() {
  return {
    name: 'transform-file',
    enforce: 'pre',

    transform(src, id) {
      if (fileRegex.test(id)) {
        console.log(src);
        const { code } = babel.transformSync(src, { presets: ['babel-preset-solid'] })!;
        console.log(code);
        return code;
        // return src.replace(/solid-js\/jsx-dev-runtime/g, 'solid-js/h/jsx-dev-runtime');
      }
    },
  };
}

export default defineConfig(({ mode }) => {
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
      solidPlugin({ include: [/PowerFlow\.tsx/] }),
      vike({ prerender: true }),
      preact({ exclude: [/PowerFlow\.tsx/] }),
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
