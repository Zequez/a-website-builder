import { useState } from 'preact/hooks';
import TextInput from '../ui/TextInput';
import useStore from '../../lib/useStore';

export default function AccessScreen() {
  const {
    store: { attemptAccessLoading },
    actions: { attemptAccess },
  } = useStore();
  const [accessKey, setAccessKey] = useState('');
  const [accessAttemptError, setAccessAttemptError] = useState<boolean>(false);

  async function handleAccessClick(ev: SubmitEvent) {
    ev.preventDefault();
    if (accessKey && !attemptAccessLoading) {
      setAccessAttemptError(!(await attemptAccess(accessKey, true)));
    }
  }

  return (
    <div class="flexcs h-full w-full flex-col space-y-4">
      <div class="text-2xl text-center">Ingrese la clave de acceso para continuar</div>
      <form class="flex flex-col space-y-4 bg-white/20 rounded-lg p-4" onSubmit={handleAccessClick}>
        <div>
          <TextInput
            label="Clave de acceso"
            type="password"
            value={accessKey}
            onChange={(v) => {
              setAccessKey(v);
              setAccessAttemptError(false);
            }}
          />
        </div>
        <label class="">
          <input type="checkbox" class="mr-2" />
          Guardar la clave en este navegador
        </label>
        {accessAttemptError ? <div class="text-red-500">Clave incorrecta</div> : null}
        <button
          disabled={!accessKey || attemptAccessLoading}
          class="bg-white/40 hover:bg-white/50 text-white rounded-md px-2 py-1 disabled:opacity-50 font-bold tracking-wider"
        >
          {attemptAccessLoading ? 'Checkeando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
