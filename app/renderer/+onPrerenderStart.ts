import { PageContext } from 'vike/types';
import { allLocales, defaultLocale } from '@server/root-hostnames';

function onPrerenderStart(prerenderContext: any) {
  const pageContexts: PageContext[] = [];
  (prerenderContext.pageContexts as PageContext[]).forEach((pageContext) => {
    // Duplicate pageContext for each locale
    allLocales.forEach((locale) => {
      // Localize URL
      let { urlOriginal } = pageContext;
      if (locale !== defaultLocale) {
        urlOriginal = `/${locale}${pageContext.urlOriginal}`;
      }
      pageContexts.push({
        ...pageContext,
        urlOriginal,
        // Set pageContext.locale
        locale,
      });
    });
  });
  return {
    prerenderContext: {
      pageContexts,
    },
  };
}

export default onPrerenderStart;
