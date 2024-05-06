import { render } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import Admin from './components/Admin';
// @ts-ignore
import dragDropTouchPolyfill from './lib/drag-drop-touch-polyfill';
import { AdminStoreContextWrapper } from './components/Admin/useAdminStore';
import UnhandledErrorsDisplay from './components/UnhandledErrorsDisplay';

// dragDropTouchPolyfill();

render(<UnhandledErrorsDisplay />, document.getElementById('unhandled-errors')!);

render(
  <AdminStoreContextWrapper init={{}}>
    <Admin />
  </AdminStoreContextWrapper>,
  document.getElementById('root')!,
);
