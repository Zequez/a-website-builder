import { parse } from 'node-html-parser';
import { EditorFile } from '../types';

export function contentToDataUrl(mime: string, content: string) {
  return `data:${mime};base64,${btoa(content)}`;
}

export function generateIframeEncodedUrl(files: { [key: string]: EditorFile }) {
  const indexContent = files['index.html'].content;
  const root = parse(indexContent);
  root.querySelectorAll('link[rel="stylesheet"]').map((el) => {
    const href = el.getAttribute('href');
    if (href?.startsWith('./')) {
      const fileName = href.slice(2);
      if (files[fileName]) {
        el.setAttribute('href', contentToDataUrl('text/css', files[fileName].content));
      }
    }
  });

  root.querySelectorAll('script[type="module"]').map((el) => {
    const src = el.getAttribute('src');
    if (src?.startsWith('./')) {
      const fileName = src.slice(2);
      if (files[fileName]) {
        el.setAttribute('src', contentToDataUrl('text/javascript', files[fileName].content));
      }
    }
  });

  return contentToDataUrl('text/html', root.innerHTML);
}
