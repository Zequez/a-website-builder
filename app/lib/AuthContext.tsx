import { JSX, createContext } from 'preact';
import { useState, useMemo, useContext, useEffect } from 'preact/hooks';
import * as api from '@app/lib/api';
import { SanitizedMember } from '@db';

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
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  setFullMember: (fullMember: SanitizedMember | null) => void;
  fullMember: SanitizedMember | null;
}>(null!);

const AUTH_LOCALSTORAGE_KEY = '_auth_token_';

export function getToken() {
  return (JSON.parse(localStorage.getItem(AUTH_LOCALSTORAGE_KEY) || '') as string) || null;
}

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

const initialContextValue = {
  memberAuth: null,
  setToken: () => null,
  signOut: () => null,
  signIn: async () => false,
  setFullMember: () => null,
  fullMember: null,
};

export const AuthWrapper = ({ children }: { children: JSX.Element }) => {
  if (import.meta.env.SSR) {
    return (
      <MemberAuthContext.Provider value={initialContextValue}>
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

  const {
    data: fullMember,
    error,
    setResource: setFullMember,
  } = api.useRemoteResource(api.getMember, { id: memberAuth?.member.id || 0 }, memberAuth);

  const memberAuthContext = useMemo(() => {
    function setToken(token: string | null) {
      if (!token) {
        localStorage.removeItem(AUTH_LOCALSTORAGE_KEY);
        setMemberAuth(null);
        api.setAuth(null);
      } else {
        const newMemberAuth = tokenToMemberAuth(token);
        const member = newMemberAuth?.member;

        if (member && member.id && member.email) {
          cleanLocalFiles(member.id);
          setMemberAuth(newMemberAuth);
          api.setAuth(newMemberAuth);
          localStorage.setItem(AUTH_LOCALSTORAGE_KEY, JSON.stringify(token));
        } else {
          console.error('Token does not contain member data; not setting token');
        }
      }
    }

    async function signIn(email: string, password: string) {
      const { data, error } = await api.signIn({ email, passphrase: password }, null);
      if (data) {
        setToken(data.token);
        return true;
      } else {
        setToken(null);
        return false;
      }
    }

    function signOut() {
      setToken(null);
      setFullMember(null);
    }

    return { memberAuth, setToken, signIn, signOut, fullMember, setFullMember };
  }, [memberAuth, fullMember]);

  return (
    <MemberAuthContext.Provider value={memberAuthContext}>{children}</MemberAuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(MemberAuthContext);
};
