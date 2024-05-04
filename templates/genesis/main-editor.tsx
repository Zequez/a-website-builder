import { hydrate } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import App from './components/AppWithEditor';
import { StoreContextWrapper } from './lib/useStore';
import { validateUuid } from '@shared/utils';
// @ts-ignore
import dragDropTouchPolyfill from './lib/drag-drop-touch-polyfill';

dragDropTouchPolyfill();

const hashSiteId = window.location.hash.slice(1);
let siteId = null;
if (validateUuid(hashSiteId)) {
  siteId = hashSiteId;
}

hydrate(
  <StoreContextWrapper siteId={siteId} editing={true}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
