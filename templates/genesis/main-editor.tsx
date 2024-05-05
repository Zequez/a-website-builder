import { render } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/AppWithEditor';
import { StoreContextWrapper } from './lib/useStore';
// @ts-ignore
import dragDropTouchPolyfill from './lib/drag-drop-touch-polyfill';
import urlHash from './lib/urlHash';

dragDropTouchPolyfill();

let { siteId } = urlHash.getData();

render(
  <StoreContextWrapper
    init={{ siteId: siteId || null, editing: true, config: null, initialPath: '/' }}
  >
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
