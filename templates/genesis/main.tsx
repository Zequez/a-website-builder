import { hydrate } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/AppWithEditor';
import createValidator from './config-validator';
import configSchema from './config-schema.yml';
import configDefault from './config-default';
import { StoreContextWrapper } from './lib/useStore';
import { validateUuid } from '@shared/utils';

const configEl = document.getElementById('config')!;

function getDocumentConfig() {
  const documentConfigRaw = configEl.innerHTML;
  let documentConfig: Config;
  try {
    documentConfig = JSON.parse(documentConfigRaw);
  } catch (e) {
    console.error('Could not find document config, falling back to default');
    return null;
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
    console.log('SCHEMA', configSchema);
    return null;
  }
}

let siteId = configEl.getAttribute('data-site-id');

const hashSiteId = window.location.hash.slice(1);
if (validateUuid(hashSiteId)) {
  siteId = hashSiteId;
}

const config = getDocumentConfig() || configDefault;

hydrate(
  <StoreContextWrapper initialConfig={config} siteId={siteId} editing={true}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
