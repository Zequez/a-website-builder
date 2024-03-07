import { useEffect, useState } from 'preact/hooks';
import cx from 'classnames';
import * as api from './lib/api';

import Auth, { useAuth } from './components/Auth/Auth';

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
      {showAuth ? (
        <div className="fixed inset-0 p-4">
          <div className="bg-white shadow-md rounded-md h-full p-2">
            <Auth />
          </div>
        </div>
      ) : null}
      <div className="h-16 bg-blue-300 text-white text-2xl flex items-center px-4 flex-shrink-0">
        <div className="flex-grow">A Web Club</div>
        <div>
          {memberAuth ? (
            <button
              class="bg-green-300 active:bg-green-200 text-white  px-2 py-1 rounded-md shadow-sm mr-4"
              onClick={signOut}
            >
              Logout
            </button>
          ) : null}
          <button
            className="bg-green-300 active:bg-green-200 text-white  px-2 py-1 rounded-md shadow-sm"
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
          <Members members={members} />
        ) : null}
      </div>
    </div>
  );
};

const Members = ({ members }: { members: Member[] }) => {
  return (
    <div className="flex-grow p-4">
      <div className="grid grid-cols-1 gap-2">
        {members.map((m) => (
          <div
            key={m.id}
            className={cx('bg-white p-2 rounded', {
              'bg-gray-200': !m.active,
            })}
          >
            <div>{m.full_name}</div>
            <div>{m.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
