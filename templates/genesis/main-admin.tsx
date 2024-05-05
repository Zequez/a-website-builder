import { render } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import Admin from './components/Admin';
// @ts-ignore
import dragDropTouchPolyfill from './lib/drag-drop-touch-polyfill';
import { AdminStoreContextWrapper } from './components/Admin/useAdminStore';

// dragDropTouchPolyfill();

render(
  <AdminStoreContextWrapper init={{}}>
    <Admin />
  </AdminStoreContextWrapper>,
  document.getElementById('root')!,
);
