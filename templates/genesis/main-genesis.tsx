import { hydrate } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/App';
import createValidator from './config-validator';
import configDefault from './config-default';
import { StoreContextWrapper } from './lib/useStore';
import urlHash from './lib/urlHash';

const configEl = document.getElementById('config')!;

let initialPath = window.location.pathname;

// On dev mode the HTML does not have the data that will be available on
// the pre-rendered site. So we load it from URL parameters for testing purposes.
if (import.meta.env.DEV) {
  const { siteId, path } = urlHash.getData();
  if (!siteId) {
    throw 'Missing site id on URL';
  }
  configEl.innerHTML = JSON.stringify(configDefault, null, 2);
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

  const validator = createValidator();
  if (validator(documentConfig)) {
    return documentConfig;
  } else {
    console.error('Invalid config', documentConfig);
    if (validator.errors) {
      for (let error of validator.errors) {
        console.error(error);
      }
    }
    throw 'Invalid document config';
  }
}

const siteId = configEl.getAttribute('data-site-id');
const config = getDocumentConfig();

hydrate(
  <StoreContextWrapper init={{ config, siteId, initialPath, editing: false }}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
