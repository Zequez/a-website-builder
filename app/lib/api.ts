import type {
  // Members
  RouteGetMembersId,
  RouteGetMembers,
  // Files
  RoutePutFilesIdQuery,
  RoutePutFilesId,
  RoutePostFilesQuery,
  RoutePostFiles,
  RouteDeleteFilesId,
  RoutePostFilesSaveBuildQuery,
  RoutePostFilesSaveBuild,
  // Sites
  RoutePostSitesQuery,
  RoutePostSites,
  RoutePutSitesIdQuery,
  RoutePutSitesId,
  RouteDeleteSitesId,
  RouteDeleteSitesIdQuery,
  // Authentication
  RoutePostAuthSignIn,
  RoutePostAuthSignUp,
  RouteGetAuthMe,
  RoutePostAuthChangePass,
  RouteGetMembersIdQuery,
  RoutePostAuthSignUpQuery,
  RoutePostAuthSignInQuery,
  RouteGetAuthMeQuery,
  RoutePostAuthChangePassQuery,
  RouteGetMembersQuery,
  RouteDeleteFilesIdQuery,
  RouteGetFiles,
  RouteGetFilesQuery,
  RouteGetSites,
  RouteGetSitesQuery,
} from '@server/routes/api/types';

import type { MemberAuth } from '@app/components/Auth';
import { useEffect, useState } from 'preact/hooks';
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/_api_' : '/_api_';

let memberAuth: MemberAuth | null = null;
export function setAuth(newAuth: MemberAuth | null) {
  memberAuth = newAuth;
}

function api<T, Q extends Record<string, any>>(
  path: string | ((q: Q) => string),
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
): ApiEndpoint<Q, T> {
  return (query: Q, authorization?: string | null | undefined) => {
    const resolvedToken = authorization || memberAuth?.token;
    const authHeader: { Authorization: string } | {} = resolvedToken
      ? { Authorization: `Bearer ${resolvedToken}` }
      : {};
    const resolvedPath = typeof path === 'string' ? path : path(query);
    const baseUrl = `${API_BASE_URL}/${resolvedPath}`;
    if (method === 'GET') {
      return typedSimplifiedResponse<T>(
        fetch(`${baseUrl}?${new URLSearchParams(query)}`, {
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
          body: JSON.stringify(query),
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

export type ApiEndpoint<T, K> = (
  params: T,
  auth?: string | null | undefined,
) => TypedSimplifiedResponse<K>;

export function useRemoteResource<T, K>(
  apiEndpoint: ApiEndpoint<T, K>,
  params: T | null,
  auth: MemberAuth | null | undefined,
) {
  const [remoteResource, setRemoteResource] = useState<K | null>(null);
  const [fetchError, setFetchError] = useState<string | string[] | null>(null);
  useEffect(() => {
    console.log('Fetching remote resource');
    const noAuthRequired = typeof auth === 'undefined';
    if ((auth || noAuthRequired) && params) {
      (async () => {
        const { data, error } = await (noAuthRequired
          ? apiEndpoint(params, undefined)
          : apiEndpoint(params, auth.token));
        if (data !== null) {
          setRemoteResource(data);
        } else {
          console.error('Error fetching remote resource', error);
          setFetchError(error);
        }
      })();
    }
  }, [auth, params]);

  return fetchError === null
    ? { data: remoteResource, error: null }
    : { data: null, error: fetchError };
}

export type TypedSimplifiedResponse<T> = ReturnType<typeof typedSimplifiedResponse<T>>;

// Auth
export const signUp = api<RoutePostAuthSignUp, RoutePostAuthSignUpQuery>('auth/signUp', 'POST');
export const signIn = api<RoutePostAuthSignIn, RoutePostAuthSignInQuery>('auth/signIn', 'POST');
export const me = api<RouteGetAuthMe, RouteGetAuthMeQuery>('auth/me', 'GET');
export const changePass = api<RoutePostAuthChangePass, RoutePostAuthChangePassQuery>(
  'auth/changePass',
  'POST',
);

// Members
export const getMembers = api<RouteGetMembers, RouteGetMembersQuery>('members', 'GET');
export const getMember = api<RouteGetMembersId, RouteGetMembersIdQuery>(
  ({ id }) => `members/${id}`,
  'GET',
);

// Files
export const getFiles = api<RouteGetFiles, RouteGetFilesQuery>('files', 'GET');
export const putFile = api<RoutePutFilesId, RoutePutFilesIdQuery>(({ id }) => `files/${id}`, 'PUT');
export const postFile = api<RoutePostFiles, RoutePostFilesQuery>('files', 'POST');
export const deleteFile = api<RouteDeleteFilesId, RouteDeleteFilesIdQuery>(
  ({ id }) => `files/${id}`,
  'DELETE',
);
export const postFilesSaveBuild = api<RoutePostFilesSaveBuild, RoutePostFilesSaveBuildQuery>(
  'files/saveBuild',
  'POST',
);

// Sites
export const getSites = api<RouteGetSites, RouteGetSitesQuery>('sites', 'GET');
export const postSite = api<RoutePostSites, RoutePostSitesQuery>('sites', 'POST');
export const putSite = api<RoutePutSitesId, RoutePutSitesIdQuery>(({ id }) => `sites/${id}`, 'PUT');
export const deleteSite = api<RouteDeleteSitesId, RouteDeleteSitesIdQuery>(
  ({ id }) => `sites/${id}`,
  'DELETE',
);

// Hooks
