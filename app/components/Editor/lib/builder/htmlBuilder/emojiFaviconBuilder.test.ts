import { it, describe, expect } from 'vitest';
import emojiFaviconBuilder from './emojiFaviconBuilder';

function createContext(files: { name: string; content: string }[], vars = {}) {
  return { files, vars, errors: [] };
}

describe('emojiFaviconBuilder', () => {
  it('should generate a B64 representation of image/favicon meta tags and replace it with image/png', () => {
    const context = createContext([
      {
        name: 'index.html',
        content:
          '<html><head><link rel="icon" type="image/emoji" href="🔅"/></head><body></body></html>',
      },
    ]);
    emojiFaviconBuilder(context);
    expect(context.files[0].content).toContain('data:image/png;base64');
    expect(context.files[0].content).toContain('type="image/png"');
    // expect(true).toBe(true);
  });
});
