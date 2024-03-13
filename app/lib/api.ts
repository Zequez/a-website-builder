import type {
  RouteResourceMembersId,
  RouteResourceMembers,
  RoutePostFilesIdQuery,
  RoutePostFilesId,
  RoutePostSitesQuery,
  RoutePostSites,
  RoutePostAuthSignIn,
  RoutePostAuthSignUp,
  RouteGetAuthMe,
  RoutePostAuthChangePass,
} from '@server/routes/api/types';

import { MemberAuth } from '@app/components/Auth';
import { useEffect, useState } from 'preact/hooks';
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/_api_' : '/_api_';

function api<T>(path: string, method: 'GET' | 'POST') {
  return (data: Record<string, any> = {}, authorization: string = '') => {
    const authHeader: { Authorization: string } | {} = authorization
      ? { Authorization: `Bearer ${authorization}` }
      : {};
    const baseUrl = `${API_BASE_URL}/${path}`;
    if (method === 'GET') {
      return typedSimplifiedResponse<T>(
        fetch(`${baseUrl}?${new URLSearchParams(data)}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
        }),
      );
    } else {
      return typedSimplifiedResponse<T>(
        fetch(baseUrl, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
          body: JSON.stringify(data),
        }),
      );
    }
  };
}

async function typedSimplifiedResponse<T>(resPromise: Promise<Response>) {
  const res = await resPromise;
  const data = await res.json();
  if (res.status === 200 || res.status === 201) {
    return { status: res.status, data, error: null } as {
      status: 200 | 201;
      data: T;
      error: null;
    };
  } else {
    return { status: res.status, data: null, error: data.error || data } as {
      status: 400 | 401 | 404 | 500;
      data: null;
      error: string | string[];
    };
  }
}

export function useRemoteResource<T, K>(
  apiEndpoint: (params: T, auth: string) => TypedSimplifiedResponse<K>,
  params: T | undefined,
  auth: MemberAuth | null,
) {
  const [remoteResource, setRemoteResource] = useState<K | null>(null);
  const [fetchError, setFetchError] = useState<string | string[] | null>(null);
  useEffect(() => {
    if (auth && params) {
      (async () => {
        const { data, error } = await apiEndpoint(params, auth.token);
        if (data !== null) {
          setRemoteResource(data);
        } else {
          console.error('Error fetching remote resource', error);
          setFetchError(error);
        }
      })();
    }
  }, [auth]);

  return fetchError === null
    ? { data: remoteResource, error: null }
    : { data: null, error: fetchError };
}

export type TypedSimplifiedResponse<T> = ReturnType<typeof typedSimplifiedResponse<T>>;

// Auth
export const signUp = api<RoutePostAuthSignUp>('auth/signUp', 'POST');
export const signIn = api<RoutePostAuthSignIn>('auth/signIn', 'POST');
export const me = api<RouteGetAuthMe>('auth/me', 'GET');
export const changePass = api<RoutePostAuthChangePass>('auth/changePass', 'POST');

// Members
export const members = api<RouteResourceMembers>('members', 'GET');
export const member = async (id: number, auth: string) =>
  await api<RouteResourceMembersId>(`members/${id}`, 'GET')({}, auth);
// export const file = async (id: string) => await api<RouteResourcePostFileId>(`files/${id}`, 'GET')({});

// Files
export const postFile = async (params: RoutePostFilesIdQuery, auth: string) =>
  await api<RoutePostFilesId>(`files/${params.id}`, 'POST')(params, auth);

// Sites
export const postSite = async (params: RoutePostSitesQuery, auth: string) =>
  await api<RoutePostSites>('sites', 'POST')(params, auth);

// Hooks
