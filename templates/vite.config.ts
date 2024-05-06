import { resolve } from 'path';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import preact from '@preact/preset-vite';
import viteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig(({ mode }) => {
  return {
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
      viteYaml(),
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
          genesis: resolve(__dirname, 'index.html'),
          editor: resolve(__dirname, 'editor.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
      },
    },
  };
});
