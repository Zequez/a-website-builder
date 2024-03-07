import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './spinner.css';
import App from './App';
import { AuthWrapper } from './components/Auth';
import { render } from 'preact';

const container = document.getElementById('root');
if (!(container instanceof HTMLElement)) throw 'No root';
render(
  <AuthWrapper>
    <App />
  </AuthWrapper>,
  container,
);
