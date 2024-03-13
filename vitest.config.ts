import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./server/test/hooks.ts'],
    globalSetup: ['./server/test/setup.ts'],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
