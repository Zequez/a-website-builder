import 'virtual:uno.css';
import { Elm } from './Editor.elm';

Elm.Editor.init({
  node: document.getElementById('root'),
  flags: 'Initial Message',
});
