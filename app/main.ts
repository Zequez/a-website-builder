import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './spinner.css';
import { Elm } from './Editor.elm';

Elm.Editor.init({
  node: document.getElementById('root'),
  flags: {
    hostname: import.meta.env.BASE_HOSTNAME,
  },
});
