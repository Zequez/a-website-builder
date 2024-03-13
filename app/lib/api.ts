import type { RouteResourceMembersId, RouteResourceFileId } from '@server/routes/api/resources';
import type {
  ResponseAuthSignIn,
  ResponseAuthSignUp,
  ResponseAuthMe,
  ResponseAuthChangePass,
} from '@server/routes/api/auth';
import { MemberAuth } from '@app/components/Auth';
import { useEffect, useState } from 'preact/hooks';
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/_api_' : '/_api_';

// let token: string | null = null;
// export function setToken(newToken: string) {
//   token = newToken;
// }

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
  // return {status: res.status, data}
  // return {
  //   status: res.status,
  //   json: async () => await res.json(),
  //   errors: async () => await res.json(),
  // } as { status: number; json: () => Promise<T>; errors: () => Promise<{ errors: string[] }> };
}

export type TypedSimplifiedResponse<T> = ReturnType<typeof typedSimplifiedResponse<T>>;

export const signUp = api<ResponseAuthSignUp>('auth/signUp', 'POST');
export const signIn = api<ResponseAuthSignIn>('auth/signIn', 'POST');
export const me = api<ResponseAuthMe>('auth/me', 'GET');
export const changePass = api<ResponseAuthChangePass>('auth/changePass', 'POST');
export const members = api('members', 'GET');
export const member = async (id: number, auth: string) =>
  await api<RouteResourceMembersId>(`members/${id}`, 'GET')({}, auth);
export const file = async (id: string) => await api<RouteResourceFileId>(`files/${id}`, 'GET')({});

// type EndpointConfig<K, T> = {
//   params: K;
//   path: string | ((params: K) => string);
//   reqBody: (params: K) => Record<string, any>;
//   resBody: T;
//   method: 'GET' | 'POST';
//   authProtected: boolean;
// };

// export function endpoint<K, T>(config: EndpointConfig<K, T>) {
//   return async (params: K) => {
//     const path = typeof config.path === 'string' ? config.path : config.path(params);
//     return api<T>(path, config.method)(config.reqBody(params))();
//   };
// }

// export function useApi() {

// }

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
