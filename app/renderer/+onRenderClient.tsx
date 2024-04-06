export default onRenderClient;

import { hydrate, render } from 'preact';
import { PageShell } from './PageShell';

async function onRenderClient(pageContext: any) {
  const { Page, pageProps } = pageContext;
  const page = (
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  );
  const container = document.querySelector('body')!;

  if (pageContext.isHydration) {
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
