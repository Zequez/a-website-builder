import { useEffect, useState } from 'preact/hooks';

import { AuthModal } from './components/Auth';
import ProgressiveSignUp from './components/ProgressiveSignUp';
import ValuePropositionPage from './components/ValuePropositionPage';

type Page = 'editor' | 'home' | 'join' | 'notFound';

function routePage() {
  let pathname = window.location.pathname;
  if (pathname === '') pathname = '/';
  switch (pathname) {
    case '/':
      return 'home';
    case '/editor':
      return 'editor';
    case '/join':
      return 'join';
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
      {page === 'home' ? <ValuePropositionPage /> : null}
      {page === 'join' ? <ProgressiveSignUp /> : null}
      {showAuthModal ? <AuthModal onClose={closeAuthModal} /> : null}
    </>
  );
};

export default App;
