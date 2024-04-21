import { useState, useEffect } from 'preact/hooks';
import ErrorIcon from '~icons/fa6-solid/circle-xmark';

import { SanitizedMember } from '@db';
import { gravatarUrl } from '@app/lib/utils';
import * as api from '@app/lib/api';
import Button from '@app/components/Button';
import { useAuth } from '@app/lib/AuthContext';
import Spinner from '@app/components/Spinner';
import Header from './Header';

const HomePage = () => {
  const { memberAuth, signOut } = useAuth();
  const [membersStatus, setMembersStatus] = useState<'loading' | 'error' | 'loaded'>('loading');
  const [members, setMembers] = useState<null | SanitizedMember[]>(null);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    (async () => {
      const { data: members, error } = await api.getMembers({}, null);
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
          <>
            <Members members={members} isAuthenticated={!!memberAuth} />
            {!memberAuth ? (
              <div class="flex justify-center pb-4">
                <Button size="lg" href="#auth">
                  Register
                </Button>
              </div>
            ) : null}
          </>
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
    <div class="flex-grow mb-4">
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

export default HomePage;
