import { useAuth } from '@app/components/Auth';
import Header from '@app/components/Header';

import AccountPanel from '@app/components/ProgressiveSignUp/AccountPanel';

export default function Page() {
  const { memberAuth, signOut } = useAuth();
  return (
    <div class="min-h-screen">
      <Header isAuth={!!memberAuth} signOut={signOut} />
      {memberAuth ? (
        <AccountPanel class="min-h-screen sm:pt-20" memberAuth={memberAuth} />
      ) : (
        <div>Sign in</div>
      )}
    </div>
  );
}
