import React, { useEffect, useState } from 'react';
import cx from 'classnames';

import * as api from './lib/api';

function getLocalStorageValue<T>(key: string) {
  const existingValue = localStorage.getItem(key);
  if (existingValue) {
    try {
      return JSON.parse(existingValue) as T;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  }
  return null;
}

function useStateLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => getLocalStorageValue<T>(key) || initialValue);
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as [T, React.Dispatch<React.SetStateAction<T>>];
}

function useAuth() {
  const [token, setToken] = useStateLocalStorage('_auth_token_', '');
  let data = null;
  if (token) {
    try {
      data = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      setToken('');
    }
  }
  return { token, data, setToken };
}

const App = () => {
  const { token, data: tokenMember, setToken } = useAuth();

  const [mode, setMode] = useState<'signUp' | 'signIn' | 'me'>(token ? 'me' : 'signUp');

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [formErrors, setFormErrors] = useState<null | string[]>(null);

  const [member, setMember] = useState<null | { email: string; full_name: string }>();

  const [showAccountCreated, setShowAccountCreated] = useState(false);

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

  return (
    <div>
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
                </div>
              </div>
            );
        }
      })()}
    </div>
  );
};

export default App;
