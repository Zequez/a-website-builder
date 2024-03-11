import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import cx from 'classnames';
import * as api from './lib/api';

import { useAuth, AuthModal } from './components/Auth';
import Editor from './components/Editor';

type Member = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
};

const App = () => {
  const { memberAuth, signOut } = useAuth();
  const [membersStatus, setMembersStatus] = useState<'loading' | 'error' | 'loaded'>('loading');
  const [members, setMembers] = useState<null | Member[]>(null);
  const [error, setError] = useState<null | string>(null);

  const [showAuth, setShowAuth] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  function goTo(place: 'editor' | 'auth' | 'home') {
    if (place === 'editor') {
      window.location.hash = 'editor';
      setShowEditor(true);
      setShowAuth(false);
    } else if (place === 'auth') {
      window.location.hash = 'auth';
      setShowAuth(true);
      setShowEditor(false);
    } else {
      window.location.hash = '';
      setShowAuth(false);
      setShowEditor(false);
    }
  }

  useEffect(() => {
    // Read hash path from URL
    const hash = window.location.hash.slice(1);
    if (hash === 'auth') {
      setShowAuth(true);
    } else if (hash === 'editor') {
      setShowEditor(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const res = await api.members({});
      if (res.status === 200) {
        const members = await res.json();
        setMembersStatus('loaded');
        setMembers(members);
      } else {
        setMembersStatus('error');
        setError('Could not load members list');
      }
    })();
  }, []);

  return (
    <div class="flex flex-col h-screen">
      {showAuth ? <AuthModal onClose={() => goTo('home')} /> : null}
      {showEditor ? <Editor onExit={() => goTo('home')} /> : null}
      <div class="h-16 bg-emerald-500 text-white text-2xl flex items-center px-4 flex-shrink-0">
        <div class="flex-grow">A Web Club</div>
        <div class="flex space-x-4">
          {memberAuth ? (
            <button
              class="block text-base px-4 py-2 rounded-md bg-red-400 text-white uppercase tracking-wider"
              onClick={signOut}
            >
              Logout
            </button>
          ) : null}
          <button
            class="block text-base px-4 py-2 rounded-md bg-blue-400 text-white uppercase tracking-wider"
            onClick={() => goTo('auth')}
          >
            {memberAuth ? 'Account' : 'Access'}
          </button>
          {memberAuth ? (
            <button
              class="block text-base px-4 py-2 rounded-md bg-emerald-400 text-white uppercase tracking-wider"
              onClick={() => goTo('editor')}
            >
              Editor
            </button>
          ) : null}
        </div>
      </div>
      <div class="flex-grow">
        {membersStatus === 'loading' ? (
          'Loading...'
        ) : membersStatus === 'error' ? (
          error
        ) : membersStatus === 'loaded' && members ? (
          <Members members={members} isAuthenticated={!!memberAuth} />
        ) : null}
        <div class="flex justify-center pb-4 pt-4">
          <button
            onClick={() => goTo('auth')}
            class="block text-base px-4 py-2 rounded-md bg-blue-400 text-white uppercase tracking-wider"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

const Members = ({ members, isAuthenticated }: { members: Member[]; isAuthenticated: boolean }) => {
  const sortedMembers = [...members].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return (
    <div class="flex-grow">
      <h1 class="text-center text-3xl py-4 text-gray-700 font-light">Members</h1>
      <div class="grid grid-cols-1 gap-2 max-w-lg mx-auto">
        {sortedMembers.map((m) => (
          <div
            key={m.id}
            class={cx('bg-white p-2 rounded border-2 border-solid', {
              'bg-gray-200': !m.active,
              'border-transparent': !m.is_admin,
              'border-blue-400': m.is_admin,
            })}
          >
            <div>
              {m.is_admin ? (
                <span class="bg-blue-400 text-white rounded-md uppercase text-xs font-bold mr-2 px-1 py-0.5">
                  Server Admin
                </span>
              ) : null}
              {m.full_name}
            </div>
            {isAuthenticated ? <div>{m.email}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const HeaderButton = ({ onClick, tw = 'bg-blue-400' }: { onClick: () => void; tw: string }) => (
  <button
    class={cx('block text-base px-4 py-2 rounded-md text-white uppercase tracking-wider', tw)}
    onClick={onClick}
  >
    Logout
  </button>
);

const Box = ({
  children,
}: {
  children: JSX.Element | string;
  tw: (string | Record<string, string>)[] | string | Record<string, string>;
}) => <div class={cx()}></div>;

export default App;
