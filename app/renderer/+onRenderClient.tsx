export default onRenderClient;

import { hydrate, render } from 'preact';
import { PageShell } from './PageShell';
import { PageContext } from 'vike/types';

async function onRenderClient(pageContext: PageContext) {
  const { Page, pageProps } = pageContext;
  const page = (
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  );
  const container = document.querySelector('#root')!;

  if (pageContext.config.ssr && pageContext.isHydration) {
    hydrate(page, container);
  } else {
    render(page, container);
  }

  if (!pageContext.isHydration) {
    const newTitle = getPageTitle(pageContext);
    if (newTitle) {
      document.title = newTitle;
    }
  }
}

function getPageTitle(pageContext: any) {
  const title = (pageContext.config || {}).title || (pageContext || {}).title;
  return title;
}
