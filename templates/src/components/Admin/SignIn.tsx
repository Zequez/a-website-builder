import { useState } from 'preact/hooks';
import useAdminStore from './useAdminStore';
import TextInput from '../ui/TextInput';
import { Button } from '../ui';

export default function SignIn() {
  const {
    store: { attemptAccessLoading },
    actions: A,
  } = useAdminStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessAttemptError, setAccessAttemptError] = useState<boolean>(false);

  const canSubmit = email && password && !attemptAccessLoading;

  async function handleAccessClick(ev: SubmitEvent) {
    ev.preventDefault();
    if (canSubmit) {
      setAccessAttemptError(false);
      setAccessAttemptError(!(await A.attemptAccess(email, password)));
    }
  }

  return (
    <div class="h-screen w-screen flexcs flex-col">
      <div class="text-3xl mb4">Ingreso</div>
      <form
        class="rounded-lg bg-white/20 p4 w-80 flex flex-col space-y-4"
        onSubmit={handleAccessClick}
      >
        <TextInput label="Email" value={email} onChange={setEmail} />
        <TextInput label="Contraseña" type="password" value={password} onChange={setPassword} />
        {accessAttemptError && <div class="text-red-500">Credenciales incorrectas</div>}
        <Button disabled={!canSubmit}>{attemptAccessLoading ? 'Checkeando...' : 'Ingresar'}</Button>
      </form>
    </div>
  );
}
