import { hydrate, render } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/App';
import { StoreContextWrapper } from './lib/useStore';
import { hash } from './lib/url-helpers';
import { tsite as getSite } from './lib/pipes';
import UnhandledErrorsDisplay from './components/UnhandledErrorsDisplay';

render(<UnhandledErrorsDisplay />, document.getElementById('unhandled-errors')!);

const configEl = document.getElementById('config')!;

let initialPath = window.location.pathname;

// On dev mode the HTML does not have the data that will be available on
// the pre-rendered site. So we load it from URL parameters for testing purposes.
if (import.meta.env.DEV) {
  const { siteId, path } = hash.getData();

  if (!siteId) {
    throw 'Missing site id on URL';
  }

  const { config } = (await getSite({ siteId: siteId, props: ['config'] }))!;
  configEl.innerHTML = JSON.stringify(config, null, 2);
  configEl.setAttribute('data-site-id', siteId);
  initialPath = path || '/';
}

function getDocumentConfig() {
  const documentConfigRaw = configEl.innerHTML;
  let documentConfig: Config;
  try {
    documentConfig = JSON.parse(documentConfigRaw);
  } catch (e) {
    throw 'Could not parse document config';
  }

  return documentConfig;
}

const siteId = configEl.getAttribute('data-site-id');
const config = getDocumentConfig();

hydrate(
  <StoreContextWrapper init={{ config, siteId, initialPath, editing: false }}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
