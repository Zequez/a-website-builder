import { useState } from 'preact/hooks';
import useAdminStore from './useAdminStore';
import TextInput from '../TextInput';

export default function SignIn() {
  const {
    store: { attemptAccessLoading },
    actions: A,
  } = useAdminStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessAttemptError, setAccessAttemptError] = useState<boolean>(false);

  const canSubmit = email && password && !attemptAccessLoading;

  async function handleAccessClick() {
    if (canSubmit) {
      setAccessAttemptError(false);
      setAccessAttemptError(!(await A.attemptAccess(email, password)));
    }
  }

  return (
    <div class="h-screen w-screen flexcs flex-col">
      <div class="text-3xl mb4">Ingreso</div>
      <div class="rounded-lg bg-white/20 p4 w-80 flex flex-col space-y-4">
        <TextInput label="Email" value={email} onChange={setEmail} />
        <TextInput label="Contraseña" type="password" value={password} onChange={setPassword} />
        {accessAttemptError && <div class="text-red-500">Credenciales incorrectas</div>}
        <button
          disabled={!canSubmit}
          onClick={handleAccessClick}
          class="w-full px2 py1 text-lg bg-white/20 rounded-md hover:bg-white/30 text-white disabled:opacity-50"
        >
          {attemptAccessLoading ? 'Checkeando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  );
}
