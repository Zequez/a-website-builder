import type { Url, PageContext } from 'vike/types';
import { defaultLocale, allLocales } from '@server/root-hostnames';

function onBeforeRoute(pageContext: PageContext) {
  const { urlWithoutLocale, locale } = extractLocale(pageContext.urlParsed);

  return {
    pageContext: {
      locale,
      urlLogical: urlWithoutLocale,
    },
  };
}

function extractLocale(url: Url) {
  let { pathname } = url;

  let locale = defaultLocale;
  for (let loc of allLocales) {
    if (pathname.startsWith(`/${loc}`)) {
      locale = loc;
      pathname = pathname.slice(3);
      break;
    }
  }

  const { origin, searchOriginal, hashOriginal } = url;
  const urlWithoutLocale = `${origin || ''}${pathname || '/'}${searchOriginal || ''}${
    hashOriginal || ''
  }`;

  return { locale, urlWithoutLocale };
}

export default onBeforeRoute;
