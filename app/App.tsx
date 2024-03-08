import { useEffect, useState } from 'preact/hooks';
import cx from 'classnames';
import * as api from './lib/api';

import { useAuth, AuthModal } from './components/Auth';

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

  useEffect(() => {
    (async () => {
      const res = await api.members({});
      if (res.status === 200) {
        const { members } = await res.json();
        setMembersStatus('loaded');
        setMembers(members);
      } else {
        setMembersStatus('error');
        setError('Could not load members list');
      }
    })();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {showAuth ? <AuthModal onClose={() => setShowAuth(false)} /> : null}
      <div className="h-16 bg-blue-300 text-white text-2xl flex items-center px-4 flex-shrink-0">
        <div className="flex-grow">A Web Club</div>
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
            className="block text-base px-4 py-2 rounded-md bg-blue-400 text-white uppercase tracking-wider"
            onClick={() => setShowAuth(true)}
          >
            {memberAuth ? 'Account' : 'Access'}
          </button>
        </div>
      </div>
      <div className="flex-grow">
        {membersStatus === 'loading' ? (
          'Loading...'
        ) : membersStatus === 'error' ? (
          error
        ) : membersStatus === 'loaded' && members ? (
          <Members members={members} isAuthenticated={!!memberAuth} />
        ) : null}
        <div class="flex justify-center pb-4">
          <button
            onClick={() => setShowAuth(true)}
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
    <div className="flex-grow p-4">
      <h1 class="text-center text-3xl mb-4 text-gray-700 font-light">Members</h1>
      <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto">
        {sortedMembers.map((m) => (
          <div
            key={m.id}
            className={cx('bg-white p-2 rounded border-2 border-solid', {
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

export default App;
