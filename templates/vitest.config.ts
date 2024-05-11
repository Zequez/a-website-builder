import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: [],
    globalSetup: [],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    environment: 'jsdom',
    // browser: {
    //   enabled: true,
    //   name: 'chrome ',
    // },
  },
});
