import { hydrate } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/App';
import createValidator from './config-validator';
import configSchema from './config-schema.yml';
import configDefault from './config-default';
import { StoreContextWrapper } from './lib/useStore';
import urlHash from './lib/urlHash';

const configEl = document.getElementById('config')!;

// On dev mode the HTML does not have the data that will be available on
// the pre-rendered site. So we load it from URL parameters for testing purposes.
if (import.meta.env.DEV) {
  const hashData = urlHash.getData();
  if (!hashData.siteId) {
    throw 'Missing site id on URL';
  }
  configEl.innerHTML = JSON.stringify(configDefault, null, 2);
  configEl.setAttribute('data-site-id', hashData.siteId);
}

function getDocumentConfig() {
  const documentConfigRaw = configEl.innerHTML;
  let documentConfig: Config;
  try {
    documentConfig = JSON.parse(documentConfigRaw);
  } catch (e) {
    throw 'Could not parse document config';
  }

  // return documentConfig;

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
    console.log('SCHEMA', configSchema);
    throw 'Invalid document config';
  }
}

const siteId = configEl.getAttribute('data-site-id');
const config = getDocumentConfig();

hydrate(
  <StoreContextWrapper init={{ config, siteId, editing: false, selectedPageId: null }}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
