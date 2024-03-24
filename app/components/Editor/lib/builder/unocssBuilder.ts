import { createGenerator } from '@unocss/core';
import presetUno from '@unocss/preset-uno';
import sanitize from '@unocss/reset/sanitize/sanitize.css?inline';
import { BuildContext } from './types.d';

const generator = createGenerator({
  presets: [presetUno],
});

export default async function unoCssBuilder(context: BuildContext) {
  const codes = context.files.filter((f) => f.name.endsWith('.html')).map((f) => f.content);
  const strings = await generator.applyExtractors(codes.join('\n'));
  const { css } = await generator.generate(strings, { minify: !import.meta.env.DEV });
  const cssFilesContents: string[] = [];
  context.files = context.files.filter((f) => {
    if (f.name.endsWith('.css')) {
      cssFilesContents.push(f.content);
      return false;
    } else {
      return true;
    }
  });

  context.files.push({ name: 'style.css', content: sanitize + css + cssFilesContents.join('\n') });
  const cssStyleTag = `<link rel="stylesheet" href="/style.css"/>`;
  context.files.forEach((file) => {
    if (file.name.endsWith('.html')) {
      const m = file.content.match(/<\/head>/);
      if (m && m.index) {
        file.content = file.content.slice(0, m.index) + cssStyleTag + file.content.slice(m.index);
      }
    }
  });
}
