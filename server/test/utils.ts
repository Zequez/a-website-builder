import { API_PATH, PORT } from '@server/config';
import { loadFixtures } from '@server/test/fixtures';

const apiUrl = `http://localhost:${PORT}/${API_PATH}/`;

export function fetchApi(apiPath: string, req?: RequestInit) {
  return fetch(`${apiUrl}${apiPath}`, req);
}

export async function signUpWith(body: any) {
  return await fetchApi('auth/signUp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function signInWith(body: any) {
  return await fetchApi('auth/signIn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export const get = (apiPath: string, token?: string) => {
  const headers: Record<string, string> = {};
  if (token !== undefined) headers.Authorization = `Bearer ${token}`;
  return fetchApi(apiPath, { headers });
};

export const genApiShortcut =
  (method: 'POST' | 'PUT' | 'DELETE' | 'PATCH') =>
  (apiPath: string, body: Record<string, any>, token?: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token !== undefined) headers.Authorization = `Bearer ${token}`;
    return fetchApi(apiPath, {
      method,
      headers,
      body: JSON.stringify(body),
    });
  };

export const post = genApiShortcut('POST');
export const put = genApiShortcut('PUT');
export const delete_ = genApiShortcut('DELETE');
export const patch = genApiShortcut('PATCH');

export { loadFixtures };

type LoadedFixtures = Awaited<ReturnType<typeof loadFixtures>>;
const fixtures = {} as LoadedFixtures;
export const preloadFixtures = async () => {
  Object.assign(fixtures, await loadFixtures());
  return fixtures;
};

export { fixtures };
