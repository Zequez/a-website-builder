import React, { useEffect, useState } from 'react';
import cx from 'classnames';

import * as api from '../lib/api';
import { useAuth } from '../lib/hooks';

const Auth = () => {
  const { token, data: tokenMember, setToken } = useAuth();

  const [mode, setMode] = useState<'signUp' | 'signIn' | 'me' | 'changePass'>(
    token ? 'me' : 'signUp',
  );

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [formErrors, setFormErrors] = useState<null | string[]>(null);

  const [member, setMember] = useState<null | { email: string; full_name: string }>();

  const [showAccountCreated, setShowAccountCreated] = useState(false);

  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmNewPassphrase, setConfirmNewPassphrase] = useState('');

  async function submitSignUp(ev: React.FormEvent) {
    ev.preventDefault();
    const res = await api.signUp({ email, passphrase, fullName });

    if (res.status !== 201) {
      const { error, errors } = await res.json();
      setMember(null);
      setToken('');
      setFormErrors(errors || [error]);
    } else {
      const { member, token } = await res.json();
      setPassphrase('');
      setFullName('');
      setMember(member);
      setToken(token);
      setMode('me');
      setShowAccountCreated(true);
      setTimeout(() => {
        setShowAccountCreated(false);
      }, 3000);
    }
  }

  async function submitSignIn(ev: React.FormEvent) {
    ev.preventDefault();
    const res = await api.signIn({ email, passphrase });
    if (res.status !== 200) {
      const { error, errors } = await res.json();
      setMember(null);
      setToken('');
      setFormErrors(errors || [error]);
    } else {
      const { member, token } = await res.json();
      setPassphrase('');
      setMember(member);
      setToken(token);
      setMode('me');
    }
  }

  function handleSignOut() {
    setMember(null);
    setToken('');
    setMode('signIn');
  }

  async function handleChangePass(ev: React.FormEvent) {
    ev.preventDefault();
    if (newPassphrase === confirmNewPassphrase) {
      const res = await api.changePass({ oldPassphrase: passphrase, newPassphrase }, token);
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
  }

  return (
    <div className="h-full">
      {!token ? (
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
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    value={fullName}
                    placeholder="Full name"
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    value={passphrase}
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassphrase(e.target.value)}
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
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    value={passphrase}
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassphrase(e.target.value)}
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
                <div>You are signed in</div>
                {tokenMember ? JSON.stringify(tokenMember) : 'No token?'}
                <div>
                  <button onClick={handleSignOut}>Sign Out</button>
                  <button onClick={() => setMode('changePass')}>Change passphrase</button>
                </div>
              </div>
            );
          case 'changePass':
            return (
              <form onSubmit={handleChangePass}>
                <div>Change passphrase</div>
                <div>
                  <input
                    value={passphrase}
                    type="password"
                    onChange={(e) => setPassphrase(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    value={newPassphrase}
                    type="password"
                    onChange={(e) => setNewPassphrase(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    value={confirmNewPassphrase}
                    type="password"
                    onChange={(e) => setConfirmNewPassphrase(e.target.value)}
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
