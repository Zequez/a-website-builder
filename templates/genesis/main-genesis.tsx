import { hydrate } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/App';
import createValidator from './config-validator';
import configSchema from './config-schema.yml';
import configDefault from './config-default';
import { StoreContextWrapper } from './lib/useStore';

const configEl = document.getElementById('config')!;

if (import.meta.env.DEV) {
  configEl.innerHTML = JSON.stringify(configDefault, null, 2);
  configEl.setAttribute('data-site-id', window.location.hash.slice(1));
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
  <StoreContextWrapper initialConfig={config} siteId={siteId} editing={false}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
