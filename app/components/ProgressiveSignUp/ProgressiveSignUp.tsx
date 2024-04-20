// import { StyleTransition } from 'preact-transitioning';

import Google from '~icons/fa6-brands/google';

import Heart from '~icons/fa6-solid/heart';

import { cx } from '@app/lib/utils';
import { signal, computed, effect } from '@preact/signals';
import { useEffect, useState } from 'preact/hooks';
import { emailAvailability, signUp } from '@app/lib/api';
import { toArr, validateEmail } from '@shared/utils';
import { useAuth } from '../Auth';
import Button from './Button';
import TextInput from './TextInput';
import CheckboxInput from './CheckboxInput';

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

const validations = {
  email: {
    sync: (email: string) => {
      if (validateEmail(email)) {
        return [];
      } else {
        return ['Please enter a valid email'];
      }
    },

    async: async (email: string) => {
      const { data, status } = await emailAvailability({ email });
      if (!data) return ['Error checking email availability'];
      return data.available ? [] : ['Email is already in use'];
    },
  },
  password: {
    sync: (password: string) => {
      if (password.length >= 6) {
        return [];
      } else {
        return ['Password has to be at least 6 characters'];
      }
    },
  },
};

export default function ProgressiveSignUp() {
  let { memberAuth, setToken } = useAuth();
  const [justSignedUpAnimation, setJustSignedUpAnimation] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState<any[]>([]);
  const showPassword = !!(email.value || password.value);
  const emailAndPass = !!(email.value && password.value);
  const [formIsBeingSubmitted, setFormIsBeingSubmitted] = useState(false);

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
        <SignUpFadeTransitionGroup in={justSignedUpAnimation}>
          <div class="text-size-[70px] h-20 animate-heartbeat text-red-400">
            <Heart />
          </div>
          <div class="text-2xl text-black/40">Thank you for signing up</div>
        </SignUpFadeTransitionGroup>
        <SignUpFadeTransitionGroup in={!justSignedUpAnimation}>
          <div class="text-size-[70px] h-20">📝</div>
          <div class="text-2xl text-black/40">
            {justSignedUp && !justSignedUpAnimation ? 'Account details' : 'Sign up'}
          </div>
        </SignUpFadeTransitionGroup>
      </div>

      {memberAuth ? (
        <div class="text-black/60 text-lg text-center">
          <div class="mb-2">You are already signed up</div>
          <Button href="/account">Open account panel</Button>
        </div>
      ) : (
        <div class="w-full">
          <div class="w-full b b-black/10 p-2 xs:p-4 bg-slate-500/5 rounded-md mb-4">
            <TextInput
              value={email.value}
              validations={validations.email}
              onFullyValid={setFullyValidInputFor('email')}
              label="Email"
              onChange={(val) => (email.value = val)}
              loadingLabel="Checking..."
              class="mb-4"
            />
            {!showPassword ? (
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
                  label="Password"
                  validations={validations.password}
                  onFullyValid={setFullyValidInputFor('password')}
                />
                {emailAndPass ? (
                  <CheckboxInput
                    checked={subscribeToNewsletter.value}
                    onChange={(v) => (subscribeToNewsletter.value = v)}
                    label="Sign up for newsletter"
                  />
                ) : null}
                {signUpErrors ? (
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
          <div class="w-full px-2 xs:px-4">
            {!emailAndPass ? (
              <div class="flex flex-col flex-items-center">
                <div class="mb-4 text-black/60">or</div>
                <Button disabled={!emailIsFullyValid.value}>Just sign up for newsletter</Button>
              </div>
            ) : null}
          </div>
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
