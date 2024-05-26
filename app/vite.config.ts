import { defineConfig, loadEnv, Plugin } from 'vite';
import { resolve, dirname, basename } from 'path';
import { promises as fs } from 'fs';
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
      htmlToFolderPlugin(),
    ],
    root: resolve(__dirname),
    base: '/app',
    build: {
      outDir: resolve(__dirname, '../dist/app'),
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

const htmlToFolderPlugin = (): Plugin => {
  return {
    name: 'html-to-folder',
    apply: 'build',
    enforce: 'post',
    async generateBundle(options, bundle) {
      for (const [fileName, file] of Object.entries(bundle)) {
        if (fileName.endsWith('.html') && !fileName.endsWith('index.html')) {
          const name = basename(fileName, '.html');
          const newFilePath = `${name}/index.html`;
          delete bundle[fileName];
          bundle[newFilePath] = { ...file, fileName: newFilePath };
        }
      }
    },
  };
};
