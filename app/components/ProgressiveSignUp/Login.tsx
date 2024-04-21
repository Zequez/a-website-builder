import TextInput from './TextInput';
import Button from './Button';
import { useState } from 'preact/hooks';
import { useLocale } from '@app/lib/useLocale';
import { useAuth } from '@app/lib/AuthContext';

const i18n = {
  en: {
    login: 'Login',
    email: 'Email',
    password: 'Password',
    loginFailed: 'Email or password are incorrect',
  },
  es: {
    login: 'Iniciar sesión',
    email: 'Email',
    password: 'Contraseña',
    loginFailed: 'Email o contraseña incorrectos',
  },
};

export default function Login() {
  const { signIn, memberAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const { t } = useLocale(i18n);

  const canSubmit = email && password;

  async function handleSubmit(ev: any) {
    ev.preventDefault();
    if (!email || !password) {
      return;
    }
    setAuthError(false);
    if (!(await signIn(email, password))) {
      setAuthError(true);
    }
  }

  return (
    <div class="flexcc pt-16 flex-col text-black/50">
      <h1 class="text-2xl mb-5">{t('login')}</h1>
      <div class="bg-slate-100 b b-black/5 w-xs p-4 rounded-md">
        {memberAuth ? (
          'Already signed in'
        ) : (
          <form class="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <TextInput label={t('email') as any} value={email} onChange={setEmail} />
            <TextInput
              label={t('password') as any}
              type="password"
              value={password}
              onChange={setPassword}
            />
            {authError && <p class="text-red-500">{t('loginFailed')}</p>}
            <Button disabled={!canSubmit}>{t('login')}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
