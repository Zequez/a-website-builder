import { API_PATH } from '@server/config';
import { endpoint } from '@server/server';

const apiUrl = `${endpoint}/${API_PATH}/`;

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
