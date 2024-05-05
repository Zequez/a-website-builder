const noLocalStorage = typeof localStorage === 'undefined';

export function setAccessKeyToken(siteId: string, token: string) {
  localStorage.setItem(`${siteId}-token`, token);
}

export function getAccessKeyToken(siteId: string | null) {
  if (!siteId || noLocalStorage) return null;
  return localStorage.getItem(`${siteId}-token`) || null;
}

export function setMemberToken(token: string) {
  localStorage.setItem('member-token', token);
}

export function getMemberToken() {
  if (noLocalStorage) return null;
  return localStorage.getItem('member-token') || null;
}
