import { render } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import 'tiny-markdown-editor/dist/tiny-mde.min.css';
import './assets/markdown.css';
import App from './components/AppWithEditor';
import { StoreContextWrapper } from './lib/useEditorStore';
// @ts-ignore
import dragDropTouchPolyfill from './lib/drag-drop-touch-polyfill';
import { hash } from './lib/url-helpers';
import UnhandledErrorsDisplay from './components/UnhandledErrorsDisplay';

dragDropTouchPolyfill();

const { siteId, path } = hash.getData();

render(<UnhandledErrorsDisplay />, document.getElementById('unhandled-errors')!);

if (!siteId || !path) throw 'Editor must be started with a siteId and path';

render(
  <StoreContextWrapper init={{ siteId: siteId, editing: true, config: null, initialPath: path }}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
