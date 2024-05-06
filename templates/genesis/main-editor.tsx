import { render } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/AppWithEditor';
import { StoreContextWrapper } from './lib/useStore';
// @ts-ignore
import dragDropTouchPolyfill from './lib/drag-drop-touch-polyfill';
import { hash } from './lib/url-helpers';

dragDropTouchPolyfill();

const { siteId, path } = hash.getData();

render(
  <StoreContextWrapper
    init={{ siteId: siteId || null, editing: true, config: null, initialPath: path || '/' }}
  >
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
