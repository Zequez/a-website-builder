import Eye from '~icons/fa6-solid/eye';
import EyeSlash from '~icons/fa6-solid/eye-slash';
import Google from '~icons/fa6-brands/google';
import SquareCheck from '~icons/fa6-solid/square-check';
import Square from '~icons/fa6-regular/square';
import CircleNotch from '~icons/fa6-solid/circle-notch';

import { cx } from '@app/lib/utils';
import { signal, effect } from '@preact/signals';
import { useState } from 'preact/hooks';

const email = signal('');
const password = signal('');
const emailErrors = signal<string[]>([]);
const subscribeToNewsletter = signal(false);
const emailIsDirty = signal(false);
const passwordIsDirty = signal(false);
const emailIsBeingChecked = signal(false);

effect(() => {
  if (!passwordIsDirty.value) {
    passwordIsDirty.value = !!password.value;
  }
});

function validateEmailShape(text: string) {
  if (text.match('@')) {
    emailErrors.value = [];
    return true;
  } else {
    emailErrors.value = ['Please enter a valid email'];
    return false;
  }
}

// effect(async () => {
//   if (emailIsDirty.value) {
//     const v1 = validateEmailShape(email.value);
//     if (v1 === true) {
//       emailErrors.value = [];
//     } else {
//       emailErrors.value = [v1];
//     }
//   }
// });

const EMAILS = ['zequez@gmail.com'];

async function validateEmailAvailability(text: string) {
  emailIsBeingChecked.value = true;
  setTimeout(() => {
    emailIsBeingChecked.value = false;
    if (EMAILS.includes(text)) {
      emailErrors.value = ['Email is already in use'];
    } else {
      emailErrors.value = [];
    }
  }, 2000);
}

// type Validator =
//   | ((text: string) => boolean | string)
//   | ((text: string) => Promise<boolean | string>);

// function validateEmail(validators: Validator[]) {
//   for (const validator of validators) {
//     const error = validator(email.value);
//     if (error) {
//       return error;
//     }
//   }
// }

export default function ProgressiveSignUp() {
  const showPassword = !!(email.value || password.value);
  const confirmEnabled = !!(email.value && password.value);
  const emailAndPass = !!(email.value && password.value);

  return (
    <div class="h-120 pb-20 flex items-center justify-center flex flex-col space-y-4">
      <div class="text-size-[70px] h-20">📝</div>
      <div class="text-2xl text-black/40 pb-4">Sign up</div>
      <div class="relative w-70">
        <TextInput
          disabled={emailIsBeingChecked.value}
          value={email.value}
          onChange={(v) => {
            email.value = v;
            if (emailIsDirty.value) {
              validateEmailShape(email.value);
            }
          }}
          label="Email"
          onBlur={() => {
            if (email.value) {
              emailIsDirty.value = true;
              if (validateEmailShape(email.value)) {
                validateEmailAvailability(email.value);
              }
            }
          }}
          loading={emailIsBeingChecked.value}
        />
        {emailErrors.value.length ? (
          <div class="text-red-400 mt-1">
            {emailErrors.value.map((err) => (
              <div>{err}</div>
            ))}
          </div>
        ) : null}
        <div
          class={cx('absolute left-4 top-1/1 text-sm', {
            'opacity-0': showPassword,
            'opacity-50': !showPassword,
          })}
        >
          ...and password
        </div>
      </div>
      <div class="h-28 relative w-70">
        <div
          class={cx('absolute top-0 w-full flex flex-col items-center', {
            'opacity-0 z-10': showPassword,
            'opacity-100 z-20': !showPassword,
          })}
        >
          <div class="py-4 text-black/60">or</div>
          <button
            disabled={showPassword}
            class={`flex w-full text-black/60 justify-center items-center bg-slate-2
            hover:(bg-slate-6 text-white/60)
            border border-slate-3 rounded-md px-4 py-2 shadow-md font-semibold
            active:(shadow-none scale-98)
            `}
          >
            <Google class="mr-2" /> Sign up with Google
          </button>
        </div>
        <div
          class={cx('relative flex flex-col transition-opacity mb-4', {
            'opacity-0 z-10': !showPassword,
            'opacity-100 z-20': showPassword,
          })}
        >
          <TextInput
            class="mb-4"
            type="password"
            value={password.value}
            onChange={(v) => (password.value = v)}
            label="Password"
          />
          <button
            disabled={!confirmEnabled}
            class={cx(
              `relative flex w-full text-black/60 justify-center items-center bg-slate-2
            border border-slate-3 rounded-md px-4 py-2 shadow-md
            hover:(bg-slate-6 text-white/60)
            disabled:(opacity-40 saturate-0 pointer-events-none)
            font-semibold
            transition-transform
            active:(shadow-none scale-98)
            `,
              {
                'translate-y-14': emailAndPass,
              },
            )}
          >
            Create account
          </button>
        </div>
        <div class={cx('relative z-30 transition-transform', { '-translate-y-14': emailAndPass })}>
          {emailAndPass ? (
            <label class="flex text-black/50 items-center h-10 cursor-pointer">
              <input
                class="h-0 w-0 opacity-0"
                type="checkbox"
                checked={subscribeToNewsletter.value}
                onChange={({ currentTarget }) =>
                  (subscribeToNewsletter.value = currentTarget.checked)
                }
              />
              {subscribeToNewsletter.value ? (
                <SquareCheck class="h-8 mr-2" />
              ) : (
                <Square class="h-8 mr-2" />
              )}{' '}
              Sign up for newsletter
            </label>
          ) : (
            <button
              disabled={!email.value && !emailAndPass}
              class={`flex w-full text-black/60 justify-center items-center bg-slate-2
            border border-slate-3 rounded-md px-4 py-2 shadow-md
            hover:(bg-slate-6 text-white/60)
            disabled:(opacity-40 saturate-0 pointer-events-none)
            font-semibold
            active:(shadow-none scale-98)
            `}
            >
              Sign up for newsletter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const TextInput = ({
  value,
  onChange,
  label,
  class: _class,
  type: _type,
  onBlur,
  disabled,
  loading,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  class?: string;
  type?: string;
  onBlur?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div class={cx('relative w-full', _class)}>
      <input
        aria-label={label}
        placeholder=" "
        class={cx(
          'peer border border-black/10 bg-white shadow-sm rounded-md h-10 w-full px-3 outline-slate-4',
          {
            'pr-10': _type === 'password',
          },
        )}
        type={showPass ? 'text' : _type}
        name={label}
        value={value}
        onChange={({ currentTarget }) => onChange(currentTarget.value)}
        onBlur={onBlur}
        disabled={disabled}
      />
      <label
        for={label}
        class={`
          absolute top-1/2 transition-all bg-white px-1 rounded-md -translate-y-1/2 left-3 text-black/40 pointer-events-none
          peer-not-placeholder-shown:(top-0 text-white bg-slate-6 scale-90)
          peer-focus:(top-0 text-white bg-slate-6 scale-90)`}
      >
        {label}
      </label>
      {_type === 'password' && (
        <button onClick={() => setShowPass(!showPass)}>
          {showPass ? (
            <Eye class="absolute right-2 top-1/2 -translate-y-1/2 text-black/40" />
          ) : (
            <EyeSlash class="absolute right-2 top-1/2 -translate-y-1/2 text-black/40" />
          )}
        </button>
      )}
      {loading && (
        <div class="absolute right-2 top-1/2 text-black opacity-40 -translate-y-1/2">
          <CircleNotch class="spin" />
          <div class="absolute translate-x-1/1 -right-4 -top-0.5 pulse-opacity">Checking...</div>
        </div>
      )}
    </div>
  );
};
