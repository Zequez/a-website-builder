// Add textShadow
import { defineConfig } from 'unocss';

export default defineConfig({
  rules: [
    [
      'text-shadow-1',
      {
        'text-shadow': '0 1px 1px rgba(0, 0, 0, 0.1)',
      },
    ],
    [
      'text-shadow-inner-1',
      {
        'text-shadow': '0 -1px 0 rgba(0, 0, 0, 0.5)',
      },
    ],
  ],
});
