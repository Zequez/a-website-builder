import { useAuth } from '@app/lib/AuthContext';
import Header from '@app/components/Header';

import Admin from '@app/components/Admin';

export default function Page() {
  const { fullMember, memberAuth, signOut } = useAuth();
  return (
    <div class="min-h-screen">
      <Header isAuth={!!memberAuth} signOut={signOut} />
      {memberAuth ? (
        fullMember ? (
          fullMember.is_admin ? (
            <Admin />
          ) : (
            "You aren't an administrator"
          )
        ) : (
          'Loading account info...'
        )
      ) : (
        'Not logged in'
      )}
    </div>
  );
}
