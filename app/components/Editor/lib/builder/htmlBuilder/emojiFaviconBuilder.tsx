import { BuildContext } from '../types';
import { parse } from 'node-html-parser';

function renderEmojiToBase64(emojiString: string) {
  if (import.meta.env.MODE === 'test') return 'data:image/png;base64,';
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d')!;

  context.font = '48px sans-serif';
  context.fillText(emojiString, 8, 48);

  const base64 = canvas.toDataURL('image/png');

  return base64;
}

export default function emojiFaviconBuilder(context: BuildContext) {
  context.files.forEach((file) => {
    if (file.name.endsWith('.html')) {
      const html = parse(file.content);
      const iconLinkTag = html.querySelector('link[rel="icon"][type="image/emoji"]');
      if (iconLinkTag) {
        const href = iconLinkTag.getAttribute('href');
        if (href && Array.from(href).length === 1) {
          iconLinkTag.setAttribute('type', 'image/png');
          iconLinkTag.setAttribute('href', renderEmojiToBase64(href));
          file.content = html.toString();
        }
      }
    }
  });
}
