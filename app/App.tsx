import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import cx from 'classnames';
import * as api from './lib/api';

import { useAuth, AuthModal } from './components/Auth';
import Editor from './components/Editor';
import { gravatarUrl } from './lib/utils';

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
    <div class="flex flex-col bg-gray-100 text-black/80">
      {showAuth ? <AuthModal onClose={() => goTo('home')} /> : null}
      {showEditor ? <Editor onExit={() => goTo('home')} /> : null}
      <div class="relative z-0 h-12 bg-lime-600/80 flex items-center px-4 flex-shrink-0">
        <div class="flex-grow flex items-center">
          <span class="rounded-md bg-white/90 shadow-sm text-lime-600 text-2xl font-semibold tracking-widest font-serif px-2 py-0.5 text-shadow-inner-1">
            HOJAWEB.XYZ
          </span>
          <div class="ml-2 text-white font-semibold">Web Building Club</div>
        </div>
        <div class="flex space-x-2">
          {memberAuth ? (
            <Button _class="bg-red-400" onClick={signOut}>
              Logout
            </Button>
          ) : null}
          <Button _class="bg-blue-400 " onClick={() => goTo('auth')}>
            {memberAuth ? 'Account' : 'Access'}
          </Button>
          {memberAuth ? (
            <Button _class="bg-emerald-400" onClick={() => goTo('editor')}>
              Editor
            </Button>
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
          <Button size="lg" onClick={() => goTo('auth')}>
            Register
          </Button>
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
      <h1 class="text-center text-3xl py-4 text-black/30 font-semibold tracking-wider">Members</h1>
      <div class="grid grid-cols-1 max-w-lg mx-auto border border-solid border-black/10 rounded-md">
        {sortedMembers.map((m) => (
          <div
            class={cx(
              'flex bg-white p-2 first:rounded-t-md last:rounded-b-md border-b border-black/5',
            )}
          >
            <div class="w-14 h-14 mr-2">
              <img
                src={gravatarUrl(m.email)}
                class="w-full h-full rounded-full border-1 border-t-0.5 border-b-3 border-solid border-black/80"
              />
            </div>
            <div key={m.id} class="">
              <div>
                {m.is_admin ? (
                  <span class="bg-blue-400 text-white rounded-md uppercase text-xs font-bold mr-2 px-1 py-0.5">
                    Server Admin
                  </span>
                ) : null}
                {m.full_name}
              </div>
              {isAuthenticated ? <div class="text-black/40">{m.email}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// const HeaderButton: FC<{ onClick: () => void; _class: string }> = ({
//   onClick,
//   _class,
//   children,
// }) => {
//   <Button onClick={onClick} _class={`${_class} `}>
//     {children}
//   </Button>;
// };

const Button: FC<{ onClick?: () => void; _class?: string; size?: 'md' | 'lg' }> = ({
  onClick,
  _class = 'bg-blue-400',
  children,
  size = 'md',
}) => (
  <button
    class={[
      'relative group block rounded-md border-1 border-solid border-white/10 text-white/85 uppercase tracking-[1px] font-semibold text-shadow-1',
      _class,
      {
        'px-2 py-1.5 text-xs': size === 'md',
        'px-3 py-2 text-base': size === 'lg',
      },
    ]}
    onClick={onClick}
  >
    {children}
    <div class="absolute inset-0 rounded-md hidden bg-white/10 group-hover:block"></div>
  </button>
);

type FC<T> = (props: { children?: JSX.Element | string } & T) => JSX.Element;

export default App;
