import { hydrate } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/App';
import createValidator from './config-validator';
import configSchema from './config-schema.yml';
import configDefault from './config-default';

function getDocumentConfig() {
  const documentConfigRaw = document.getElementById('config')!.innerHTML;
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

const config = getDocumentConfig() || configDefault;

hydrate(<App initialConfig={config} />, document.getElementById('root')!);
