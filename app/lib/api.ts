const API_BASE_URL = 'http://localhost:3000/_api_';

const api =
  (path: string, method: 'GET' | 'POST') =>
  (data: any, authorization: string = '') => {
    const authHeader: { Authorization: string } | {} = authorization
      ? { Authorization: `Bearer ${authorization}` }
      : {};
    const baseUrl = `${API_BASE_URL}/${path}`;
    if (method === 'GET') {
      return fetch(`${baseUrl}?${new URLSearchParams(data)}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });
    } else {
      return fetch(baseUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(data),
      });
    }
  };

export const signUp = api('auth/signUp', 'POST');
export const signIn = api('auth/signIn', 'POST');
export const me = api('auth/me', 'GET');
export const changePass = api('auth/changePass', 'POST');
