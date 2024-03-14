import { useState, useEffect } from 'preact/hooks';
import ErrorIcon from '~icons/fa6-solid/circle-xmark';

import { SanitizedMember } from '@db';
import { gravatarUrl } from '@app/lib/utils';
import * as api from '@app/lib/api';
import Button from '@app/components/Button';
import { useAuth } from '@app/components/Auth';
import Spinner from '@app/components/Spinner';

const HomePage = () => {
  const { memberAuth, signOut } = useAuth();
  const [membersStatus, setMembersStatus] = useState<'loading' | 'error' | 'loaded'>('loading');
  const [members, setMembers] = useState<null | SanitizedMember[]>(null);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    (async () => {
      const { data: members, error } = await api.members({});
      if (members) {
        setMembersStatus('loaded');
        setMembers(members);
      } else {
        setMembersStatus('error');
        setError('Could not load members list');
      }
    })();
  }, []);

  return (
    <div class="flex flex-col bg-gray-100 text-black/80 min-h-screen">
      <Header isAuth={!!memberAuth} signOut={signOut} />
      <div class="flex-grow">
        {membersStatus === 'loading' ? (
          <div class="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : membersStatus === 'error' ? (
          <div class="flex items-center justify-center h-40">
            <div class="flex items-center justify-center text-black/50">
              <ErrorIcon class="h-16 w-16 text-black/50 mr-4" />
              {error}
            </div>
          </div>
        ) : membersStatus === 'loaded' && members ? (
          <Members members={members} isAuthenticated={!!memberAuth} />
        ) : null}
        {!memberAuth ? (
          <div class="flex justify-center pb-4 pt-4">
            <Button size="lg" href="#auth">
              Register
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Members = ({
  members,
  isAuthenticated,
}: {
  members: SanitizedMember[];
  isAuthenticated: boolean;
}) => {
  const sortedMembers = [...members].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return (
    <div class="flex-grow">
      <h1 class="text-center text-3xl py-4 text-black/30 font-semibold tracking-wider">Members</h1>
      <div class="grid grid-cols-1 max-w-screen-sm mx-auto border border-solid border-black/10 sm:rounded-md">
        {sortedMembers.map((m) => (
          <div class="flex bg-white p-2 sm:first:rounded-t-md sm:last:rounded-b-md border-b border-black/5">
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

const Header = ({ isAuth, signOut }: { isAuth: boolean; signOut: () => void }) => {
  return (
    <div class="relative z-0 bg-lime-600/80 flex flex-wrap items-center px-4 flex-shrink-0 pt-2">
      <div class="flex-grow flex items-center justify-center h-10 mb-2">
        <span class="rounded-md bg-white/90 shadow-sm text-lime-600 text-xl md:text-2xl font-semibold tracking-widest font-serif px-2 py-0.5 text-shadow-inner-1">
          HOJAWEB.XYZ
        </span>
        <div class="ml-2 text-white font-semibold">Web Building Club</div>
      </div>
      <div class="flex space-x-2 justify-center  items-center flex-grow h-10 mb-2">
        {isAuth ? (
          <Button _class="bg-red-400" onClick={signOut}>
            Logout
          </Button>
        ) : null}
        <Button _class="bg-blue-400 " href="#auth">
          {isAuth ? 'Account' : 'Access'}
        </Button>
        {isAuth ? (
          <Button _class="bg-emerald-400" href="/editor">
            Editor
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default HomePage;
