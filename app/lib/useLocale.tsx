import { usePageContext } from '@app/renderer/usePageContext';
import { JSX, h } from 'preact';
import { useCallback } from 'preact/hooks';

export type TranslateHelper = (key: string, asJsx?: boolean) => string | JSX.Element;

const fallback = 'en';
export function useLocale(data: Record<string, Record<string, string | JSX.Element>>) {
  const { locale } = usePageContext();

  const t: TranslateHelper = useCallback(function (key: string, asJsx: boolean = false) {
    const str = data[locale] && data[locale][key] ? data[locale][key] : data[fallback][key];
    return str || key;
  }, []);

  // function tHtml(key: string) {
  //   t(key).split('').map(());
  // }

  return { t };
}
