import { useEffect, useState } from 'preact/hooks';

import { useAuth, AuthModal } from './components/Auth';
import Editor from './components/Editor';
import HomePage from './pages/HomePage';

type Page = 'editor' | 'home' | 'notFound';

function routePage() {
  let pathname = window.location.pathname;
  if (pathname.startsWith('/app')) pathname = pathname.replace(/^\/app/, '');
  if (pathname === '') pathname = '/';
  switch (pathname) {
    case '/':
      return 'home';
    case '/editor':
      return 'editor';
    default:
      return 'notFound';
  }
}

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [page, setPage] = useState<Page>(() => routePage());

  function closeAuthModal() {
    setShowAuthModal(false);
    window.location.hash = '';
  }

  useEffect(() => {
    function parseHash() {
      const hash = window.location.hash.slice(1);
      if (hash === 'auth') {
        setShowAuthModal(true);
      }
    }

    parseHash();

    window.addEventListener('hashchange', parseHash);
    return () => {
      window.removeEventListener('hashchange', parseHash);
    };
  }, []);

  return (
    <>
      {page === 'home' ? <HomePage /> : null}
      {page === 'editor' ? <Editor /> : null}
      {showAuthModal ? <AuthModal onClose={closeAuthModal} /> : null}
    </>
  );
};

export default App;
