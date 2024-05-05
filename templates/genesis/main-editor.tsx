import { hydrate } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/AppWithEditor';
import { StoreContextWrapper } from './lib/useStore';
// @ts-ignore
import dragDropTouchPolyfill from './lib/drag-drop-touch-polyfill';
import configDefault from './config-default';
import urlHash from './lib/urlHash';

dragDropTouchPolyfill();

let { siteId } = urlHash.getData();

hydrate(
  <StoreContextWrapper
    init={{ siteId: siteId || null, editing: true, config: configDefault, selectedPageId: null }}
  >
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
