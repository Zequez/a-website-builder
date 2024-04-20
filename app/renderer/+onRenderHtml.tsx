import { PageContext } from 'vike/types';

import renderToString from 'preact-render-to-string';
import { PageShell } from './PageShell';
import { escapeInject, dangerouslySkipEscape } from 'vike/server';

import americas from '../favicons/americas.png';
import asiaoceania from '../favicons/asiaoceania.png';
import europeafrica from '../favicons/europeafrica.png';

async function onRenderHtml(pageContext: PageContext) {
  const { Page, pageProps } = pageContext;
  const pageHtml = renderToString(
    <PageShell pageContext={pageContext}>{Page ? <Page {...pageProps} /> : null}</PageShell>,
  );

  const config = pageContext.config;
  const title = (config && config.title) || 'Hoja';
  const desc = (config && config.description) || 'Cooperative Web Creation';

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/png" href="${americas}" href-2=${asiaoceania} href-3=${europeafrica} />
        <script type="module">
          const ic = document.querySelector('link[rel="icon"]');
          const icons = [ic.getAttribute('href'), ic.getAttribute('href-2'), ic.getAttribute('href-3')];
          const icon = icons[(Math.random() * icons.length) | 0];
          ic.setAttribute('href', icon);
        </script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        ${dangerouslySkipEscape(pageHtml)}
        <div id="floating-menus"></div>
        <div id="fullscreen-preview"></div>
        <div id="solid-root"></div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vike.dev/page-redirection
    },
  };
}

export default onRenderHtml;
