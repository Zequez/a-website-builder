import type { Url, PageContext } from 'vike/types';
import { defaultLocale, allLocales, locales } from '@server/root-hostnames';

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
  let hostLocale: string | null = null;

  if (typeof window !== 'undefined') {
    hostLocale = locales[window.location.hostname];
  }

  if (hostLocale) {
    locale = hostLocale;
  } else {
    for (let loc of allLocales) {
      if (pathname.startsWith(`/${loc}`)) {
        locale = loc;
        pathname = pathname.slice(3);
        break;
      }
    }
  }

  const { origin, searchOriginal } = url;
  const urlWithoutLocale = `${origin || ''}${pathname || '/'}${searchOriginal || ''}`;

  return { locale, urlWithoutLocale };
}

export default onBeforeRoute;
