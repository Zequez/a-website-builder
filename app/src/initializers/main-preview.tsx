import './base';
import { render } from 'preact';
import App from '../components/App';
import { StoreContextWrapper } from '../lib/useEditorStore';
import { hash } from '../lib/url-helpers';

const { siteId, path } = hash.getData();

if (!siteId && !path) throw 'El previsualizador necesita parámetros en la URL /#!siteId=*path=*';

render(
  <StoreContextWrapper init={{ config: null, siteId, initialPath: path, editing: false }}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
