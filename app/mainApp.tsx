import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './spinner.css';
import App from './App';
import { render } from 'preact';

const container = document.getElementById('root');
if (!(container instanceof HTMLElement)) throw 'No root';
render(<App />, container);
