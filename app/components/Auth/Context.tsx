import { JSX, createContext } from 'preact';
import { useState, useMemo, useContext } from 'preact/hooks';

type TokenData = {
  id: number;
  email: string;
  fullName: string;
  exp: number;
  iat: number;
};

type Member = {
  id: number;
  email: string;
  full_name: string;
};

export type MemberAuth = {
  token: string;
  member: Member;
  expiresAt: Date;
};

export const MemberAuthContext = createContext<{
  memberAuth: MemberAuth | null;
  setToken: (token: string | null) => void;
}>(null!);

const AUTH_LOCALSTORAGE_KEY = '_auth_token_';

function tokenDataToMember(tokenData: TokenData): Member {
  return {
    id: tokenData.id,
    email: tokenData.email,
    full_name: tokenData.fullName,
  };
}

function tokenToMemberAuth(token: string): MemberAuth | null {
  if (token) {
    const tokenData = JSON.parse(atob(token.split('.')[1])) as TokenData;
    const member = tokenDataToMember(tokenData);
    return {
      token,
      member,
      expiresAt: new Date(tokenData.exp * 1000),
    };
  } else {
    return null;
  }
}

export const AuthWrapper = ({ children }: { children: JSX.Element }) => {
  const [memberAuth, setMemberAuth] = useState<MemberAuth | null>(() => {
    try {
      const token = JSON.parse(localStorage.getItem(AUTH_LOCALSTORAGE_KEY) || '""');
      return tokenToMemberAuth(token);
    } catch (e) {
      console.error('Error reading token from localstorage; removing key');
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
        const newMemberAuth = tokenToMemberAuth(token);
        const member = newMemberAuth?.member;

        if (member && member.id && member.email && member.full_name) {
          setMemberAuth(newMemberAuth);
          localStorage.setItem(AUTH_LOCALSTORAGE_KEY, JSON.stringify(token));
        } else {
          console.error('Token does not contain member data; not setting token');
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
