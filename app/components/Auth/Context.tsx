import { JSX, createContext } from 'preact';
import { useState, useMemo, useContext, useEffect } from 'preact/hooks';
import * as api from '@app/lib/api';
import AuthModal from './AuthModal';

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

function cleanLocalFiles(memberId: number) {
  const storageMemberIdRaw = localStorage.getItem('storage_member_id');
  const storageMemberId = storageMemberIdRaw ? JSON.parse(storageMemberIdRaw) : null;
  if (storageMemberId && storageMemberId !== memberId) {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('__FILES__') || key.startsWith('__SITES__')) {
        localStorage.removeItem(key);
      }
    });
  }
}

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
  if (import.meta.env.SSR) {
    return (
      <MemberAuthContext.Provider value={{ memberAuth: null, setToken: () => null }}>
        {children}
      </MemberAuthContext.Provider>
    );
  }

  const [memberAuth, setMemberAuth] = useState<MemberAuth | null>(() => {
    try {
      const token = JSON.parse(localStorage.getItem(AUTH_LOCALSTORAGE_KEY) || '""');
      const newMemberAuth = tokenToMemberAuth(token);
      api.setAuth(newMemberAuth);
      return newMemberAuth;
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
        api.setAuth(null);
      } else {
        const newMemberAuth = tokenToMemberAuth(token);
        const member = newMemberAuth?.member;

        if (member && member.id && member.email && member.full_name) {
          cleanLocalFiles(member.id);
          setMemberAuth(newMemberAuth);
          api.setAuth(newMemberAuth);
          localStorage.setItem(AUTH_LOCALSTORAGE_KEY, JSON.stringify(token));
        } else {
          console.error('Token does not contain member data; not setting token');
        }
      }
    }
    return { memberAuth, setToken };
  }, [memberAuth]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  function closeAuthModal() {
    setShowAuthModal(false);
    window.location.hash = '';
  }

  useEffect(() => {
    function parseHash() {
      const hash = window.location.hash.slice(1);
      if (hash === 'auth') {
        setShowAuthModal(true);
      }
    }

    parseHash();

    window.addEventListener('hashchange', parseHash);
    return () => {
      window.removeEventListener('hashchange', parseHash);
    };
  }, []);

  return (
    <MemberAuthContext.Provider value={memberAuthContext}>
      {children}
      {showAuthModal ? <AuthModal onClose={closeAuthModal} /> : null}
    </MemberAuthContext.Provider>
  );
};

export const useAuth = () => {
  const { memberAuth, setToken } = useContext(MemberAuthContext);

  function signOut() {
    setToken(null);
  }

  return { memberAuth, signOut };
};
