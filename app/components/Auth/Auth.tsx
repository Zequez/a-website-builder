import { JSX } from 'preact';
import { useEffect, useState, useContext, useRef } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import { MemberAuthContext } from './Context';
import cx from 'classnames';

export type FC<T> = (props: { children?: JSX.Element | string } & T) => JSX.Element;

import * as api from '../../lib/api';

const Auth = () => {
  const { memberAuth, setToken } = useContext(MemberAuthContext);

  const [mode, setMode] = useState<'signUp' | 'signIn' | 'me' | 'changePass'>(
    memberAuth ? 'me' : 'signUp',
  );

  const firstInputRef = useRef<HTMLInputElement>();

  // useEffect(() => {
  //   if (memberAuth) {
  //     setMode('me');
  //   } else {
  //     setMode('signUp');
  //   }
  // }, [memberAuth]);

  // lock page scroll when this component is mounted
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [mode]);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [formErrors, setFormErrors] = useState<null | string[]>(null);

  const [showAccountCreated, setShowAccountCreated] = useState(false);

  const [newPassphrase, setNewPassphrase] = useState('');

  const submitSignUp: JSX.SubmitEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    const { data, error } = await api.signUp({ email, passphrase, fullName }, null);

    if (data) {
      setPassphrase('');
      setFullName('');
      setToken(data.token);
      setMode('me');
      setShowAccountCreated(true);
      setTimeout(() => {
        setShowAccountCreated(false);
      }, 3000);
    } else {
      setToken(null);
      setFormErrors(arrError(error));
    }
  };

  const submitSignIn: JSX.SubmitEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    const { data, error } = await api.signIn({ email, passphrase }, null);
    if (data) {
      setPassphrase('');
      setToken(data.token);
      setMode('me');
    } else {
      setToken(null);
      setFormErrors(arrError(error));
    }
  };

  const submitChangePass: JSX.SubmitEventHandler<HTMLFormElement> = async (ev) => {
    console.log('Submitting change pass', ev);
    ev.preventDefault();
    if (newPassphrase.length >= 6) {
      const { data, error } = await api.changePass(
        { oldPassphrase: passphrase, newPassphrase },
        memberAuth!.token,
      );
      if (data) {
        setPassphrase('');
        setNewPassphrase('');
        setFormErrors([]);
        setMode('me');
      } else {
        setFormErrors(arrError(error));
      }
    } else {
      setFormErrors(['Password has to be at least 6 characters']);
    }
  };

  function handleSignOut() {
    setToken(null);
    setMode('signIn');
  }

  return (
    <div className="h-full">
      {!memberAuth ? (
        <div class="flex justify-center pb-4">
          <div class="border-1 rounded-md border-gray-200">
            <button
              class={cx('px-4 py-2 rounded-l-md', {
                'bg-gray-400 text-white shadow-inner': mode === 'signUp',
              })}
              onClick={() => setMode('signUp')}
            >
              Registration
            </button>
            <button
              class={cx('px-4 py-2 rounded-r-md', {
                'bg-gray-400 text-white shadow-inner': mode === 'signIn',
              })}
              onClick={() => setMode('signIn')}
            >
              Log In
            </button>
          </div>
        </div>
      ) : null}
      {(() => {
        switch (mode) {
          case 'signUp':
            return (
              <form onSubmit={submitSignUp}>
                <Header>Registration</Header>
                <div class="table mx-auto">
                  <Input value={email} onChange={setEmail} label="Email" ref={firstInputRef} />
                  <Input value={fullName} onChange={setFullName} label="Full name" />
                  <Input
                    value={passphrase}
                    onChange={setPassphrase}
                    label="Password"
                    type="password"
                  />
                </div>
                <FormErrors errors={formErrors} />
                <SubmitButton>Sign Up</SubmitButton>
              </form>
            );
          case 'signIn':
            return (
              <form onSubmit={submitSignIn}>
                <Header>Log In</Header>
                <div class="table mx-auto">
                  <Input value={email} onChange={setEmail} label="Email" ref={firstInputRef} />
                  <Input
                    value={passphrase}
                    onChange={setPassphrase}
                    label="Password"
                    type="password"
                  />
                </div>
                <FormErrors errors={formErrors} />
                <SubmitButton>Enter</SubmitButton>
              </form>
            );
          case 'me':
            return (
              <div>
                <Header>Account Information</Header>
                {memberAuth ? (
                  <table class="mx-auto mb-2">
                    <tr>
                      <td class="opacity-50 pr-4 text-right">Email</td>
                      <td>{memberAuth.member.email}</td>
                    </tr>
                    <tr>
                      <td class="opacity-50 pr-4 text-right">Name</td>
                      <td>{memberAuth.member.full_name}</td>
                    </tr>
                  </table>
                ) : null}
                <SubmitButton danger onClick={handleSignOut}>
                  Log out
                </SubmitButton>
                <ActionButton onClick={() => setMode('changePass')}>Change Password</ActionButton>
              </div>
            );
          case 'changePass':
            return (
              <form onSubmit={submitChangePass}>
                <Header>Change Password</Header>
                <div class="table mx-auto">
                  <Input
                    value={passphrase}
                    onChange={setPassphrase}
                    label="Current Password"
                    type="password"
                  />
                  <Input
                    value={newPassphrase}
                    onChange={setNewPassphrase}
                    label="New Password"
                    type="password"
                  />
                </div>
                <FormErrors errors={formErrors} />
                <SubmitButton>Change Password</SubmitButton>
                <ActionButton secondary onClick={() => setMode('me')}>
                  Back
                </ActionButton>
              </form>
            );
        }
      })()}
    </div>
  );
};

const Header: FC<{}> = ({ children }) => <h2 class="text-center text-3xl mb-4">{children}</h2>;

const Input = forwardRef(
  (
    {
      value,
      type,
      onChange,
      label,
    }: {
      value: string;
      type?: string;
      onChange: (val: string) => void;
      label: string;
    },
    ref,
  ) => {
    const [showPass, setShowPass] = useState(false);
    const isPassword = type === 'password';
    return (
      <div class="table-row">
        <span class="pr-2 table-cell text-right text-gray-500">{label}</span>
        <div class="table-cell pb-2 relative">
          <input
            value={value}
            type={showPass ? 'text' : type}
            onChange={({ currentTarget }) => onChange(currentTarget.value)}
            ref={ref as any}
            class={cx(
              'block border-box w-60 shadow-inner bg-white border-1 border-gray-300 rounded-md px-2 py-1',
              {
                'pr-14': isPassword,
              },
            )}
          />
          {isPassword ? (
            <div
              class="absolute top-1 right-2 text-gray"
              onClick={isPassword ? () => setShowPass(!showPass) : undefined}
            >
              {showPass ? 'Hide' : 'Show'}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

type ButtonType = FC<{
  type?: string;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
}>;

const SubmitButton: ButtonType = (props) => ActionButton({ ...props, type: 'submit' });
const ActionButton: ButtonType = ({ children, type, onClick, secondary, danger }) => (
  <div class="text-center pt-2">
    <button
      type={type}
      onClick={(ev) => {
        type !== 'submit' && ev.preventDefault();
        onClick?.();
      }}
      class={cx('px-4 py-2 rounded-md  text-white uppercase tracking-wider', {
        'bg-blue-400': !secondary && !danger,
        'bg-gray-400': secondary,
        'bg-red-400': danger,
      })}
    >
      {children}
    </button>
  </div>
);

const FormErrors = ({ errors }: { errors: string[] | null }) => {
  return errors && errors.length ? (
    <div class="text-red-500 text-center">
      {errors.map((error) => (
        <div>{error}</div>
      ))}
    </div>
  ) : null;
};

function arrError(error: string | string[]) {
  if (typeof error === 'string') {
    return [error];
  } else {
    return error;
  }
}

export default Auth;
