import { JSX, createContext } from 'preact';
import { useState, useMemo, useContext } from 'preact/hooks';

type MemberAuth = {
  token: string;
  member: { id: number; email: string; full_name: string };
  expiresAt: Date;
};

export const MemberAuthContext = createContext<{
  memberAuth: MemberAuth | null;
  setToken: (token: string | null) => void;
}>(null!);

const AUTH_LOCALSTORAGE_KEY = '_auth_token_';

export const AuthWrapper = ({ children }: { children: JSX.Element }) => {
  const [memberAuth, setMemberAuth] = useState<MemberAuth | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_LOCALSTORAGE_KEY) || 'null') as MemberAuth;
    } catch (e) {
      localStorage.removeKey(AUTH_LOCALSTORAGE_KEY);
      return null;
    }
  });

  const memberAuthContext = useMemo(() => {
    function setToken(token: string | null) {
      if (!token) {
        localStorage.removeItem(AUTH_LOCALSTORAGE_KEY);
        setMemberAuth(null);
      } else {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const member = {
          id: tokenData.id,
          email: tokenData.email,
          full_name: tokenData.fullName,
        };
        if (member.id && member.email && member.full_name) {
          setMemberAuth({
            token,
            member,
            expiresAt: new Date(tokenData.exp),
          });
          localStorage.setItem(AUTH_LOCALSTORAGE_KEY, JSON.stringify(token));
        }
      }
    }
    return { memberAuth, setToken };
  }, [memberAuth]);

  return (
    <MemberAuthContext.Provider value={memberAuthContext}>{children}</MemberAuthContext.Provider>
  );
};

export const useAuth = () => {
  const { memberAuth, setToken } = useContext(MemberAuthContext);

  function signOut() {
    setToken(null);
  }

  return { memberAuth, signOut };
};
