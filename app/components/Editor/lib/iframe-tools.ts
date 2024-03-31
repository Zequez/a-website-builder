import { parse } from 'node-html-parser';
import { LocalFile } from '../types';
import { keyBy, encodeB64 } from '@shared/utils';

export function contentToDataUrl(mime: string, content: string) {
  try {
    return `data:${mime};base64,${encodeB64(content)}`;
  } catch (e) {
    console.error('Error converting content to data url', e);
    return null;
  }
}

export function generateIframeEncodedUrl(
  files: { name: string; content: string }[],
  page: string = 'index.html',
): string | null {
  const filesByName = keyBy(files, 'name');
  const currentPage = filesByName[page];
  if (!currentPage) return null;

  const content = currentPage.content;
  const root = parse(content);
  root.querySelectorAll('link[rel="stylesheet"]').map((el) => {
    const href = el.getAttribute('href');
    let fileName = '';
    if (href) {
      if (href.startsWith('./')) {
        fileName = href.slice(2);
      }
      if (href.startsWith('/')) {
        fileName = href.slice(1);
      }
    }
    if (fileName) {
      if (filesByName[fileName]) {
        const content = contentToDataUrl('text/css', filesByName[fileName].content);
        if (content) el.setAttribute('href', content);
      }
    }
  });

  root.querySelectorAll('script[type="module"]').map((el) => {
    const src = el.getAttribute('src');
    if (src?.startsWith('./')) {
      const fileName = src.slice(2);
      if (filesByName[fileName]) {
        const content = contentToDataUrl('text/javascript', filesByName[fileName].content);
        if (content) el.setAttribute('src', content);
      }
    }
  });

  return contentToDataUrl('text/html', root.innerHTML);
}
