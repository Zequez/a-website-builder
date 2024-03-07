import { JSX, createContext } from 'preact';
import { useEffect, useState, useMemo, useContext } from 'preact/hooks';
import { MemberAuthContext } from './Context';
import cx from 'classnames';

import * as api from '../../lib/api';

const Auth = () => {
  const { memberAuth, setToken } = useContext(MemberAuthContext);

  const [mode, setMode] = useState<'signUp' | 'signIn' | 'me' | 'changePass'>(
    memberAuth ? 'me' : 'signUp',
  );

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [formErrors, setFormErrors] = useState<null | string[]>(null);

  const [showAccountCreated, setShowAccountCreated] = useState(false);

  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmNewPassphrase, setConfirmNewPassphrase] = useState('');

  const submitSignUp: JSX.SubmitEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    const res = await api.signUp({ email, passphrase, fullName });

    if (res.status !== 201) {
      const { error, errors } = await res.json();
      setToken(null);
      setFormErrors(errors || [error]);
    } else {
      const { token } = await res.json();
      setPassphrase('');
      setFullName('');
      setToken(token);
      setMode('me');
      setShowAccountCreated(true);
      setTimeout(() => {
        setShowAccountCreated(false);
      }, 3000);
    }
  };

  const submitSignIn: JSX.SubmitEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    const res = await api.signIn({ email, passphrase });
    if (res.status !== 200) {
      const { error, errors } = await res.json();
      setToken(null);
      setFormErrors(errors || [error]);
    } else {
      const { member, token } = await res.json();
      setPassphrase('');
      setToken(token);
      setMode('me');
    }
  };

  const submitChangePass: JSX.SubmitEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    if (newPassphrase === confirmNewPassphrase) {
      const res = await api.changePass(
        { oldPassphrase: passphrase, newPassphrase },
        memberAuth!.token,
      );
      if (res.status === 200) {
        setPassphrase('');
        setNewPassphrase('');
        setConfirmNewPassphrase('');
        setFormErrors([]);
        setMode('me');
      } else {
        const { error, errors } = await res.json();
        setFormErrors(errors || [error]);
      }
    } else {
      setFormErrors(['Passphrases do not match']);
    }
  };

  function handleSignOut() {
    setToken('');
    setMode('signIn');
  }

  return (
    <div className="h-full">
      {!memberAuth ? (
        <div>
          <button
            className={cx({ 'bg-red-400': mode === 'signUp' })}
            onClick={() => setMode('signUp')}
          >
            Sign Up
          </button>
          <button
            className={cx({ 'bg-red-400': mode === 'signIn' })}
            onClick={() => setMode('signIn')}
          >
            Sign In
          </button>
        </div>
      ) : null}
      {(() => {
        switch (mode) {
          case 'signUp':
            return (
              <form onSubmit={submitSignUp}>
                <div>
                  <input
                    value={email}
                    placeholder="Email"
                    onChange={({ currentTarget }) => setEmail(currentTarget.value)}
                  />
                </div>
                <div>
                  <input
                    value={fullName}
                    placeholder="Full name"
                    onChange={({ currentTarget }) => setFullName(currentTarget.value)}
                  />
                </div>
                <div>
                  <input
                    value={passphrase}
                    type="password"
                    placeholder="Password"
                    onChange={({ currentTarget }) => setPassphrase(currentTarget.value)}
                  />
                </div>
                {formErrors && formErrors.map((error) => <div>{error}</div>)}
                <div>
                  <button type="submit">Sign Up</button>
                </div>
              </form>
            );
          case 'signIn':
            return (
              <form onSubmit={submitSignIn}>
                <div>
                  <input
                    value={email}
                    placeholder="Email"
                    onChange={({ currentTarget }) => setEmail(currentTarget.value)}
                  />
                </div>
                <div>
                  <input
                    value={passphrase}
                    type="password"
                    placeholder="Password"
                    onChange={({ currentTarget }) => setPassphrase(currentTarget.value)}
                  />
                </div>
                {formErrors && formErrors.map((error) => <div>{error}</div>)}
                <div>
                  <button type="submit">Sign In</button>
                </div>
              </form>
            );
          case 'me':
            return (
              <div>
                <div class="bg-green-400">You are signed in</div>
                {memberAuth ? JSON.stringify(memberAuth.member) : 'No token?'}
                <div>
                  <button onClick={handleSignOut}>Sign Out</button>
                  <button onClick={() => setMode('changePass')}>Change passphrase</button>
                </div>
              </div>
            );
          case 'changePass':
            return (
              <form onSubmit={submitChangePass}>
                <div>Change passphrase</div>
                <div>
                  <input
                    value={passphrase}
                    type="password"
                    onChange={({ currentTarget }) => setPassphrase(currentTarget.value)}
                  />
                </div>
                <div>
                  <input
                    value={newPassphrase}
                    type="password"
                    onChange={({ currentTarget }) => setNewPassphrase(currentTarget.value)}
                  />
                </div>
                <div>
                  <input
                    value={confirmNewPassphrase}
                    type="password"
                    onChange={({ currentTarget }) => setConfirmNewPassphrase(currentTarget.value)}
                  />
                </div>
                <div>{formErrors && formErrors.map((error) => <div>{error}</div>)}</div>
                <div>
                  <button onClick={() => setMode('me')}>Back</button>
                  <button type="submit">Change</button>
                </div>
              </form>
            );
        }
      })()}
    </div>
  );
};

export default Auth;
