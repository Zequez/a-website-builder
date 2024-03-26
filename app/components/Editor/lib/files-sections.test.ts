import { it, describe, expect } from 'vitest';
import { relocateFiles } from './files-sections';

describe('relocateFiles', () => {
  it.each([
    ['foo.html', 'pages/foo.jsx'],
    ['foo.jsx', 'pages/foo.jsx'],
    ['style.css', 'other/style.css'],
    ['index.html', 'pages/index.jsx'],
    ['script.js', 'other/script.js'],
    ['pages/foo.html', 'pages/foo.jsx'],
  ])('should rename %s to %s', (name, newName) => {
    expect(relocateFiles([{ name }])[0].name).toEqual(newName);
  });
});
