import Eye from '~icons/fa6-solid/eye';
import EyeSlash from '~icons/fa6-solid/eye-slash';
import Google from '~icons/fa6-brands/google';
import SquareCheck from '~icons/fa6-solid/square-check';
import Square from '~icons/fa6-regular/square';
import CircleNotch from '~icons/fa6-solid/circle-notch';

import { cx } from '@app/lib/utils';
import { signal, computed, effect } from '@preact/signals';
import { useState } from 'preact/hooks';
import { emailAvailability } from '@app/lib/api';
import { validateEmail } from '@shared/utils';

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
      const { data } = await emailAvailability({ email });
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

// type Validation = {sync: (val: string) => any[], async: (val: string) => Promise<any[]>}

// class FormValidator {
//   validations: {[key: string]: Validation};
//   constructor (validations: {[key: string]: Validation}) {
//     this.validations = validations;
//   }
// }

export default function ProgressiveSignUp() {
  const showPassword = !!(email.value || password.value);
  const emailAndPass = !!(email.value && password.value);

  function submitSignUp() {}

  return (
    <div class="h-120 max-w-80 mx-auto pb-20 flex items-center  flex flex-col">
      <div class="text-size-[70px] h-20 mb-4">📝</div>
      <div class="text-2xl text-black/40 pb-4 mb-4">Sign up</div>

      <div class="w-full b b-black/10 p-4 bg-slate-500/5 rounded-md mb-4">
        <TextInput
          value={email.value}
          validations={validations.email}
          onFullyValid={setFullyValidInputFor('email')}
          label="Email"
          onChange={(val) => (email.value = val)}
          loadingLabel="Checking..."
          class="mb-4"
          autoFocus
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
              <label class="flex text-black/50 items-center h-10 cursor-pointer mb-4">
                <input
                  class="h-0 w-0 opacity-0 peer"
                  type="checkbox"
                  checked={subscribeToNewsletter.value}
                  onChange={({ currentTarget }) =>
                    (subscribeToNewsletter.value = currentTarget.checked)
                  }
                />
                <div class="peer-focus:bg-slate-500/50 rounded-md -ml-2 px-2">
                  {subscribeToNewsletter.value ? (
                    <SquareCheck class="h-8 " />
                  ) : (
                    <Square class="h-8" />
                  )}
                </div>{' '}
                Sign up for newsletter
              </label>
            ) : null}
            <Button disabled={!formIsFullyValid.value}>Create account</Button>
          </div>
        )}
      </div>
      <div class="w-full px-4">
        {!emailAndPass ? (
          <div class="flex flex-col flex-items-center">
            <div class="mb-4 text-black/60">or</div>
            <Button disabled={!emailIsFullyValid.value}>Just sign up for newsletter</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const Button = ({
  children,
  disabled,
  class: _class,
}: {
  children: any;
  disabled?: boolean;
  class?: string | Record<string, boolean>;
}) => {
  return (
    <button
      disabled={disabled}
      class={cx(
        `flex w-full text-black/60 justify-center items-center bg-slate-2
            border border-slate-3 rounded-md px-4 py-2 shadow-md
            hover:(bg-slate-6 text-white/60)
            disabled:(opacity-40 saturate-0 pointer-events-none)
            outline-slate-4
            font-semibold
            active:(shadow-none scale-98)
            `,
        _class,
      )}
    >
      {children}
    </button>
  );
};

let didFocus = false;
const TextInput = ({
  value,
  onChange,
  label,
  class: _class,
  type: _type,
  onBlur,
  disabled,
  loading,
  loadingLabel,
  validations,
  onFullyValid,
  autoFocus,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  class?: string;
  type?: string;
  onBlur?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  validations?: { sync?: (val: string) => any[]; async?: (val: string) => Promise<any[]> };
  onFullyValid?: (isFullyValid: boolean) => void;
  autoFocus?: boolean;
}) => {
  const [showPass, setShowPass] = useState(false);
  const [isModifiedAndBlurred, setIsModifiedAndBlurred] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isLoadingAsyncValidation, setIsLoadingAsyncValidation] = useState(false);

  const showErrors = isModifiedAndBlurred && validationErrors.length > 0;

  return (
    <div class={cx('relative w-full', _class)}>
      <div class="relative w-full">
        <input
          ref={(el) => {
            if (!didFocus && autoFocus) {
              el?.focus();
              didFocus = true;
            }
          }}
          aria-label={label}
          placeholder=" "
          class={cx('peer border  shadow-sm rounded-md h-10 w-full px-3', {
            'pr-10': _type === 'password',
            'border-red-500 bg-red-500/10 outline-red-500': validationErrors.length > 0,
            'border-black/10 bg-white outline-slate-4': validationErrors.length === 0,
          })}
          type={showPass ? 'text' : _type}
          name={label}
          value={value}
          onChange={({ currentTarget }) => {
            const newValue = currentTarget.value;
            onChange(newValue);
            if (validations?.sync) {
              const errors = validations.sync(newValue);
              setValidationErrors(errors);
              if (!validations.async) {
                onFullyValid?.(errors.length === 0);
              }
            }
            if (validations?.async) {
              onFullyValid?.(false);
            }
          }}
          onBlur={async ({ currentTarget }) => {
            const isModifiedAndBlurred = value !== '';
            setIsModifiedAndBlurred(isModifiedAndBlurred);
            if (isModifiedAndBlurred) {
              if (validations?.async) {
                if (validationErrors.length === 0) {
                  setIsLoadingAsyncValidation(true);
                  const errors = await validations.async(value);
                  setValidationErrors(errors);
                  onFullyValid?.(errors.length === 0);
                  setIsLoadingAsyncValidation(false);
                }
              }
            }
          }}
          disabled={disabled || isLoadingAsyncValidation}
        />
        <label
          for={label}
          class={cx(
            `
          absolute top-1/2 transition-all bg-white px-1 rounded-md -translate-y-1/2 left-3 text-black/40 pointer-events-none
          peer-not-placeholder-shown:(top-0 text-white bg-slate-6 scale-90)
          peer-focus:(top-0 text-white bg-slate-6 scale-90)`,
            {
              'peer-focus:bg-red-500! peer-not-placeholder-shown:bg-red-500!': showErrors,
            },
          )}
        >
          {label}
        </label>
        {_type === 'password' && (
          <button
            onClick={() => setShowPass(!showPass)}
            class="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 outline-slate-4"
          >
            {showPass ? <Eye /> : <EyeSlash />}
          </button>
        )}
        {isLoadingAsyncValidation && (
          <div class="absolute right-2 top-1/2 text-black opacity-40 -translate-y-1/2">
            <CircleNotch class="spin" />
            <div class="absolute translate-x-1/1 -right-4 -top-0.5 pulse-opacity">
              {loadingLabel}
            </div>
          </div>
        )}
      </div>
      {isModifiedAndBlurred && validationErrors.length ? (
        <div class="text-red-500 mt-1">
          {validationErrors.map((error) => (
            <div>{error}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
