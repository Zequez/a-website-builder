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

render(
  <StoreContextWrapper
    init={{ siteId: siteId || null, editing: true, config: null, initialPath: path || '/' }}
  >
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
