import { defineConfig } from 'vitest/config';

import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./test/hooks.ts'],
    globalSetup: ['./test/setup.ts'],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
