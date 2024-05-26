import './base';
import { hydrate } from 'preact';
import App from '../components/App';
import { StoreContextWrapper } from '../lib/useEditorStore';

const { config, siteId } = getDocumentConfig();
const initialPath = window.location.pathname;

hydrate(
  <StoreContextWrapper init={{ config, siteId, initialPath, editing: false }}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);

function getDocumentConfig() {
  const configEl = document.getElementById('config')!;
  const documentConfigRaw = configEl.innerHTML;
  let config: Config;
  try {
    config = JSON.parse(documentConfigRaw);
  } catch (e) {
    throw 'Could not parse document config';
  }

  const siteId = configEl.getAttribute('data-site-id');

  if (!siteId) throw 'No site id on page';

  return { config, siteId };
}
