import {
  // Members
  type RouteGetMembersId,
  type RouteGetMembers,
  // Files
  type RoutePutFilesIdQuery,
  type RoutePutFilesId,
  type RoutePostFilesQuery,
  type RoutePostFiles,
  type RouteDeleteFilesId,
  type RoutePostFilesSaveBuildQuery,
  type RoutePostFilesSaveBuild,
  // Sites
  type RoutePostSitesQuery,
  type RoutePostSites,
  type RoutePutSitesIdQuery,
  type RoutePutSitesId,
  type RouteDeleteSitesId,
  type RouteDeleteSitesIdQuery,
  // Authentication
  type RoutePostAuthSignIn,
  type RoutePostAuthSignUp,
  type RouteGetAuthMe,
  type RouteGetMembersIdQuery,
  type RoutePostAuthSignUpQuery,
  type RoutePostAuthSignInQuery,
  type RouteGetAuthMeQuery,
  // Misc
  type RouteGetMembersQuery,
  type RouteDeleteFilesIdQuery,
  type RouteGetFiles,
  type RouteGetFilesQuery,
  type RouteGetSites,
  type RouteGetSitesQuery,
  type RoutePatchMembersId,
  type RoutePatchMembersIdQuery,
  RouteGetMembersAvailability,
  RouteGetMembersAvailabilityQuery,
  RoutePostAuthGoogleRemove,
  RoutePostAuthGoogleRemoveQuery,
} from '@server/routes/api/types';

import type { MemberAuth } from '@app/lib/AuthContext';
import { useEffect, useState } from 'preact/hooks';
import {
  RoutePostMediaUploadUrl,
  RoutePostMediaUploadUrlQuery,
} from '@server/routes/api/resources/media';
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/_api_' : '/_api_';

let memberAuth: MemberAuth | null = null;
export function setAuth(newAuth: MemberAuth | null) {
  memberAuth = newAuth;
}

export function api<T, Q extends Record<string, any>>(
  path: string | ((q: Q) => string),
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
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
  try {
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
  } catch (e) {
    return {
      status: 500,
      data: null,
      error: ['Something went wrong, please contact admin or try again later'],
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
  auth?: MemberAuth | null | undefined,
  effect?: (resource: K | null, error: string | string[] | null) => void,
) {
  const [remoteResource, setRemoteResource] = useState<K | null>(null);
  const [fetchError, setFetchError] = useState<string | string[] | null>(null);
  useEffect(() => {
    const noAuthRequired = typeof auth === 'undefined';
    if ((auth || noAuthRequired) && params) {
      (async () => {
        const { data, error } = await (noAuthRequired
          ? apiEndpoint(params, undefined)
          : apiEndpoint(params, auth.token));
        if (data !== null) {
          setRemoteResource(data);
          effect?.(data, null);
        } else {
          console.error('Error fetching remote resource', error);
          setFetchError(error);
          effect?.(null, error);
        }
      })();
    }
  }, [auth, JSON.stringify(params)]);

  return fetchError === null
    ? { data: remoteResource, error: null, setResource: setRemoteResource }
    : { data: null, error: fetchError, setResource: setRemoteResource };
}

export type TypedSimplifiedResponse<T> = ReturnType<typeof typedSimplifiedResponse<T>>;

// Auth
export const signUp = api<RoutePostAuthSignUp, RoutePostAuthSignUpQuery>('auth/signUp', 'POST');
export const signIn = api<RoutePostAuthSignIn, RoutePostAuthSignInQuery>('auth/signIn', 'POST');
export const me = api<RouteGetAuthMe, RouteGetAuthMeQuery>('auth/me', 'GET');
export const googleRemove = api<RoutePostAuthGoogleRemove, RoutePostAuthGoogleRemoveQuery>(
  'auth/google/remove',
  'POST',
);

// Media

export const mediaUploadUrl = api<RoutePostMediaUploadUrl, RoutePostMediaUploadUrlQuery>(
  'media/upload-url',
  'POST',
);

// Members
export const getMembers = api<RouteGetMembers, RouteGetMembersQuery>('members', 'GET');
export const getMember = api<RouteGetMembersId, RouteGetMembersIdQuery>(
  ({ id }) => `members/${id}`,
  'GET',
);
export const patchMember = api<RoutePatchMembersId, RoutePatchMembersIdQuery>(
  ({ id }) => `members/${id}`,
  'PATCH',
);
export const getAvailability = api<RouteGetMembersAvailability, RouteGetMembersAvailabilityQuery>(
  'members/availability',
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
