import { useAuth } from '@app/lib/AuthContext';
import Header from '@app/components/Header';
import ProgressiveSignUp from '@app/components/ProgressiveSignUp/ProgressiveSignUp';

export default function Page() {
  const { memberAuth, signOut } = useAuth();
  return (
    <div class="min-h-screen">
      <Header isAuth={!!memberAuth} signOut={signOut} />
      <ProgressiveSignUp />
    </div>
  );
}
