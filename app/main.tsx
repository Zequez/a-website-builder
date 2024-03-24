import './styles';
import { render, options } from 'preact';
import cx from 'classnames';
import App from './App';
import { AuthWrapper } from './components/Auth';

const oldHook = options.vnode;

options.vnode = (vnode) => {
  if (vnode.type && vnode.props && (vnode.props as any).class) {
    let props = vnode.props as any;
    props.class = Array.isArray(props.class)
      ? cx(...props.class)
      : typeof props.class === 'string'
      ? props.class
      : cx(props);
  }
  return oldHook ? oldHook(vnode) : vnode;
};

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
    <App />
  </AuthWrapper>,
  container,
);
