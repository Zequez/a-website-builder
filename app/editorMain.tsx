import './styles';
import { render } from 'preact';
import { AuthWrapper } from './components/Auth';
import Editor from './components/Editor';

if (import.meta.env.DEV) {
  const hostnameParts = location.hostname.split('.');
  if (hostnameParts.length > 1) {
    window.location.href = `${location.protocol}//${hostnameParts.slice(1)}:${location.port}${
      location.pathname
    }`;
  }
}

const container = document.getElementById('root');
if (!(container instanceof HTMLElement)) throw 'No root';
render(
  <AuthWrapper>
    <Editor />
  </AuthWrapper>,
  container,
);
