import { parse } from 'node-html-parser';
import { encode } from 'js-base64';
import { LocalFile } from '../types';

export function contentToDataUrl(mime: string, content: string) {
  try {
    return `data:${mime};base64,${encode(content)}`;
  } catch (e) {
    console.error('Error converting content to data url', e);
    return null;
  }
}

export function generateIframeEncodedUrl(
  files: { [key: string]: LocalFile },
  entryPoint: string = 'index.html',
): string | null {
  const entrypointFile = files[entryPoint];
  if (!entrypointFile) return null;
  const content = entrypointFile.content;
  const root = parse(content);
  root.querySelectorAll('link[rel="stylesheet"]').map((el) => {
    const href = el.getAttribute('href');
    if (href?.startsWith('./')) {
      const fileName = href.slice(2);
      if (files[fileName]) {
        const content = contentToDataUrl('text/css', files[fileName].content);
        if (content) el.setAttribute('href', content);
      }
    }
  });

  root.querySelectorAll('script[type="module"]').map((el) => {
    const src = el.getAttribute('src');
    if (src?.startsWith('./')) {
      const fileName = src.slice(2);
      if (files[fileName]) {
        const content = contentToDataUrl('text/javascript', files[fileName].content);
        if (content) el.setAttribute('src', content);
      }
    }
  });

  return contentToDataUrl('text/html', root.innerHTML);
}
