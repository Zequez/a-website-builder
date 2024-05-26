import './base';
import 'tiny-markdown-editor/dist/tiny-mde.min.css';
import { render } from 'preact';
import { hash } from '../lib/url-helpers';
import App from '../components/AppWithEditor';
import { StoreContextWrapper } from '../lib/useEditorStore';

// @ts-ignore
import dragDropTouchPolyfill from '../lib/drag-drop-touch-polyfill';
dragDropTouchPolyfill();

const { siteId, path } = hash.getData();

if (!siteId || !path) throw 'Editor must be started with a siteId and path';

render(
  <StoreContextWrapper init={{ siteId: siteId, editing: true, config: null, initialPath: path }}>
    <App />
  </StoreContextWrapper>,
  document.getElementById('root')!,
);
