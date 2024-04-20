import { usePageContext } from '@app/renderer/usePageContext';
import { h } from 'preact';

const fallback = 'en';
export function useLocale(data: Record<string, Record<string, string>>) {
  const { locale } = usePageContext();

  function t(key: string, asJsx: boolean = false) {
    const str = data[locale] && data[locale][key] ? data[locale][key] : data[fallback][key];
    return str || key;
  }

  // function tHtml(key: string) {
  //   t(key).split('').map(());
  // }

  return { t };
}
