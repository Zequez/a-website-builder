import { Ref, useEffect } from 'preact/hooks';
import noiseImg from '../assets/noise.png';

export async function generateDataUrlFromImage(src: string, opacity: number) {
  return new Promise(async (resolve) => {
    const img = document.createElement('img');
    img.src = src;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.globalAlpha = opacity / 100;
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob!));
    });
  });
}

const CACHED: { [key: string]: { [key: string]: string } } = {};

export function usePatternBackgroundWithOpacity(
  pattern: 'noise' | 'none',
  opacity: number,
  el: { current: HTMLElement | null },
) {
  return useEffect(() => {
    if (!el.current) return;
    if (CACHED[pattern] && CACHED[pattern][opacity]) {
      el.current!.style.backgroundImage = `url(${CACHED[pattern][opacity]})`;
    }
    if (opacity > 0) {
      const img = pattern === 'noise' ? noiseImg : null;
      if (img) {
        generateDataUrlFromImage(img, opacity).then((url) => {
          el.current!.style.backgroundImage = `url(${url})`;
          CACHED[pattern] ||= {};
          (CACHED[pattern] as any)[opacity] = url;
        });
      }
    }
  }, [pattern, opacity, el.current]);
}
