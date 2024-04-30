import { toArr } from '@shared/utils';
import { getToken, useAuth } from './AuthContext';
import { useCallback, useEffect, useState } from 'preact/hooks';
import type { Functions as F } from '@server/routes/api/functions';

export const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/_api_/' : '/_api_/';

export class ApiFetchError extends Error {
  // Define additional properties for the error
  constructor(message: string, public status: number, public messages: string[]) {
    super(message);
    this.name = 'ApiFetchError'; // Set the error name (optional)
    this.status = status;
    this.messages = messages;
  }
}

export type ApiEndpoint<QueryT extends Record<string, any>, ResponseT> = ReturnType<
  typeof apiFetchWrapper<QueryT, ResponseT>
>;

export function apiFetchWrapper<QueryT extends Record<string, any>, ResponseT>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string | ((q: QueryT) => string),
) {
  return (query: QueryT, authorization?: string) =>
    apiFetch<QueryT, ResponseT>(method, path, query, authorization);
}

export async function pipeFetch<QueryT, ResponseT>(
  fun: string,
  query?: QueryT,
  authorization?: string,
) {
  return await apiFetch<QueryT, ResponseT>(
    'POST',
    `pipe/${fun}`,
    (query || {}) as QueryT,
    authorization,
  );
}

export function pipeWrapper<QueryT, ResponseT>(fun: string) {
  return async (query: QueryT, authorization?: string) => {
    const { data } = (await pipeFetch<QueryT, ResponseT>(fun, query, authorization)) as any;
    return data as ResponseT;
  };
}

export async function apiFetch<QueryT, ResponseT>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string | ((q: QueryT) => string),
  query: QueryT,
  authorization?: string,
) {
  const resolvedAuth = authorization || getToken();
  const authHeader: { Authorization: string } | {} = resolvedAuth
    ? { Authorization: `Bearer ${resolvedAuth}` }
    : {};

  const resolvedPath = typeof path === 'string' ? path : path(query);
  const baseUrl = `${API_BASE_URL}${resolvedPath}`;
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader,
  };

  const res =
    method === 'GET'
      ? await fetch(`${baseUrl}?${new URLSearchParams(query || {})}`, {
          method,
          headers,
        })
      : await fetch(baseUrl, {
          method,
          headers,
          body: JSON.stringify(query || {}),
        });

  if (res.status >= 200 && res.status <= 299) {
    return res.json() as ResponseT;
  } else {
    const errorData = await res.json();
    const errors = errorData.error ? toArr(errorData.error) : [];
    const message = errors.length ? errors.join(', ') : 'No info';
    throw new ApiFetchError(message, res.status, errors);
  }
}

export function useRemoteResource<QueryT extends Record<string, any>, ResponseT>(
  apiEndpoint: ApiEndpoint<QueryT, ResponseT>,
  config: { waitForAuth?: boolean; query: QueryT },
) {
  const { memberAuth } = useAuth();
  const [resource, setResource] = useState<ResponseT | null>(null);
  const [error, setError] = useState<ApiFetchError | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchResource = useCallback(() => {
    setLoading(true);
    return apiEndpoint(config.query, memberAuth?.token)
      .then((data) => {
        setResource(data);
        setError(null);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [JSON.stringify(config.query), config.waitForAuth ? memberAuth : null]);

  useEffect(() => {
    if ((config.waitForAuth && memberAuth) || !config.waitForAuth) {
      fetchResource();
    }
  }, [fetchResource]);

  return { resource, error, setResource, loading, refetch: fetchResource };
}
