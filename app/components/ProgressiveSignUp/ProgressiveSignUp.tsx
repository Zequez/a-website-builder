// import { StyleTransition } from 'preact-transitioning';

import Google from '~icons/fa6-brands/google';

import Heart from '~icons/fa6-solid/heart';

import { cx } from '@app/lib/utils';
import { signal, computed, effect } from '@preact/signals';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { emailAvailability, signUp } from '@app/lib/api';
import { toArr, validateEmail } from '@shared/utils';
import { useAuth } from '@app/lib/AuthContext';
import Button from './Button';
import TextInput from './TextInput';
import CheckboxInput from './CheckboxInput';
import { TranslateHelper, useLocale } from '@app/lib/useLocale';

const NEWSLETTER = false;

const i18n = {
  en: {
    thankYou: 'Thank you for signing up',
    alreadySignedUp: 'You are already signed up',
    signUp: 'Sign up',
    openAccount: 'Open account panel',
    openEditor: 'Open editor',
    logout: 'Logout',
    email: 'Email',
    checkingEmail: 'Checking...',
    password: 'Password',
    signUpForNewsletter: 'Sign up for newsletter',
    'error.email.invalid': 'Please enter a valid email',
    'error.email.inUse': 'Email is already in use',
    'error.email.serverError': 'Error checking email availability',
    'error.password.invalid': 'Password has to be at least 6 characters',
  },
  es: {
    thankYou: 'Gracias por registrarte',
    alreadySignedUp: 'Ya estas registrado',
    signUp: 'Registrarse',
    openAccount: 'Abrir panel de cuenta',
    openEditor: 'Abrir editor',
    logout: 'Salir',
    email: 'Email',
    checkingEmail: 'Chequeando...',
    password: 'Contraseña',
    signUpForNewsletter: 'Recibir novedades',
    'error.email.invalid': 'Por favor ingresa un correo valido',
    'error.email.inUse': 'El correo ya se encuentra en uso',
    'error.email.serverError': 'Error al verificar disponibilidad del correo',
    'error.password.invalid': 'La contraseña debe tener al menos 6 caracteres',
  },
};

const GOOGLE_AUTH_LINK = '';

const email = signal('');
const password = signal('');
const subscribeToNewsletter = signal(false);

const fullyValidInputs = signal<{ email: boolean; password: boolean }>({
  email: false,
  password: false,
});

const setFullyValidInputFor = (key: 'email' | 'password') => (fullyValid: boolean) => {
  fullyValidInputs.value = { ...fullyValidInputs.value, [key]: fullyValid };
};

const emailIsFullyValid = computed(() => {
  return fullyValidInputs.value.email;
});

const formIsFullyValid = computed(() => {
  let isValid = true;
  for (const key in fullyValidInputs.value) {
    const val = fullyValidInputs.value[key as keyof typeof fullyValidInputs.value];
    if (!val) {
      isValid = false;
      break;
    }
  }
  return isValid;
});

const genValidations = (t: TranslateHelper) => ({
  email: {
    sync: (email: string) => {
      if (validateEmail(email)) {
        return [];
      } else {
        return [t('error.email.invalid')];
      }
    },

    async: async (email: string) => {
      const { data, status } = await emailAvailability({ email });
      if (!data) return [t('error.email.serverError')];
      return data.available ? [] : [t('error.email.inUse')];
    },
  },
  password: {
    sync: (password: string) => {
      if (password.length >= 6) {
        return [];
      } else {
        return [t('error.password.invalid')];
      }
    },
  },
});

export default function ProgressiveSignUp() {
  let { memberAuth, setToken, signOut } = useAuth();
  const [justSignedUpAnimation, setJustSignedUpAnimation] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState<any[]>([]);
  const showPassword = !!(email.value || password.value);
  const emailAndPass = !!(email.value && password.value);
  const [formIsBeingSubmitted, setFormIsBeingSubmitted] = useState(false);
  const { t } = useLocale(i18n);

  const validations = useMemo(() => {
    return genValidations(t);
  }, [t]);

  // Tiny fix for memberAuth being always null on SSG
  // If we use it on first render the hydration messes up
  const [hidrationDone, setHidrationDone] = useState(false);
  if (!hidrationDone) memberAuth = null;
  useEffect(() => {
    setHidrationDone(true);
  }, []);

  // useEffect(() => {
  //   window.addEventListener('keydown', (ev) => {
  //     if (ev.key === '-') {
  //       setJustSignedUpAnimation((v) => !v);
  //     }
  //   });
  // }, []);

  async function submitSignUp() {
    if (formIsFullyValid.value) {
      setFormIsBeingSubmitted(true);
      const { data, error, status } = await signUp({
        email: email.value,
        password: password.value,
        subscribedToNewsletter: subscribeToNewsletter.value,
      });
      if (error) {
        setSignUpErrors(toArr(error));
      } else if (data) {
        setJustSignedUp(true);
        setJustSignedUpAnimation(true);
        setSignUpErrors([]);
        setToken(data.token);
        setTimeout(() => {
          setJustSignedUpAnimation(false);
        }, 4000);
      }
      setFormIsBeingSubmitted(false);
    }
  }

  return (
    <div
      class="w-full max-w-80 mx-auto pt-8 pb-20 flex items-center  flex flex-col p-2"
      onKeyUp={(ev) => {
        if (ev.key === 'Enter') {
          submitSignUp();
        }
      }}
    >
      <div class="relative text-center h-60 w-full">
        <SignUpFadeTransitionGroup in={justSignedUp}>
          <div class="text-size-[70px] h-20 animate-heartbeat text-red-400">
            <Heart />
          </div>
          <div class="text-2xl text-black/40">{t('thankYou')}</div>
        </SignUpFadeTransitionGroup>
        <SignUpFadeTransitionGroup in={!justSignedUp}>
          <div class="text-size-[70px] h-20">📝</div>
          <div class="text-2xl text-black/40">{t('signUp')}</div>
        </SignUpFadeTransitionGroup>
      </div>

      {memberAuth ? (
        <div class="text-black/60 text-lg text-center flex flex-col space-y-2">
          <div class="mb-2">{t('alreadySignedUp')}</div>
          <Button href="/account">{t('openAccount')}</Button>
          <Button href="/editor">{t('openEditor')}</Button>
          <Button
            onClick={() => {
              signOut();
              setJustSignedUp(false);
            }}
          >
            {t('logout')}
          </Button>
        </div>
      ) : (
        <div class="w-full">
          <div class="w-full b b-black/10 p-2 xs:p-4 bg-slate-500/5 rounded-md mb-4">
            <TextInput
              value={email.value}
              validations={validations.email}
              onFullyValid={setFullyValidInputFor('email')}
              label={t('email') as any}
              onChange={(val) => (email.value = val)}
              loadingLabel={t('checkingEmail') as any}
              class="mb-4"
            />
            {!showPassword && GOOGLE_AUTH_LINK ? (
              <div class={cx('w-full flex flex-col items-center mb-4', {})}>
                <div class="mb-4 text-black/60">or</div>
                <Button disabled={showPassword}>
                  <Google class="mr-2" /> Sign up with Google
                </Button>
              </div>
            ) : (
              <div class={cx('relative flex flex-col mb-4', {})}>
                <TextInput
                  class="mb-4"
                  type="password"
                  value={password.value}
                  onChange={(v) => (password.value = v)}
                  label={t('password') as any}
                  validations={validations.password}
                  onFullyValid={setFullyValidInputFor('password')}
                />
                {emailAndPass || !NEWSLETTER ? (
                  <CheckboxInput
                    checked={subscribeToNewsletter.value}
                    onChange={(v) => (subscribeToNewsletter.value = v)}
                    label={t('signUpForNewsletter') as any}
                  />
                ) : null}
                {signUpErrors.length ? (
                  <div class="text-red-500 mb-4">
                    {signUpErrors.map((error) => (
                      <div>{error}</div>
                    ))}
                  </div>
                ) : null}
                <Button
                  disabled={!formIsFullyValid.value || formIsBeingSubmitted}
                  onClick={submitSignUp}
                >
                  Create account
                </Button>
              </div>
            )}
          </div>
          {NEWSLETTER ? (
            <div class="w-full px-2 xs:px-4">
              {!emailAndPass ? (
                <div class="flex flex-col flex-items-center">
                  <div class="mb-4 text-black/60">or</div>
                  <Button disabled={!emailIsFullyValid.value}>Just sign up for newsletter</Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

const SignUpFadeTransitionGroup = ({ children, in: _in }: { children: any; in: boolean }) =>
  // <StyleTransition
  //   in={_in}
  //   duration={1500}
  //   styles={{
  //     enter: { opacity: 0 },
  //     enterActive: { opacity: 1 },
  //     exit: { opacity: 1 },
  //     exitActive: { opacity: 0 },
  //   }}
  // >
  _in ? (
    <div class="absolute inset-0 flex flex-col space-y-4 items-center justify-center transition-opacity duration-1500">
      {children}
    </div>
  ) : null;
// </StyleTransition>
