import { toArr } from '@shared/utils';
import { useCallback, useEffect, useState } from 'preact/hooks';

export const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/_api_/' : '/_api_/';

export class ApiFetchError extends Error {
  // Define additional properties for the error
  constructor(
    message: string,
    public status: number,
    public messages: string[],
  ) {
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
    if (data) {
      if (Array.isArray(data)) {
        data.forEach(datifyProps);
      } else if (typeof data === 'object') {
        datifyProps(data);
      }
    }
    return data as ResponseT;
  };
}

function datifyProps(data: any) {
  for (let k in data) {
    if (k.endsWith('_at') && data[k] != null) {
      data[k] = new Date(data[k]);
    }
  }
}

export async function apiFetch<QueryT, ResponseT>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string | ((q: QueryT) => string),
  query: QueryT,
  authorization?: string,
) {
  const resolvedAuth = authorization;
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
