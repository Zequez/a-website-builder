import { useEffect, useState } from 'preact/hooks';

export function useStateLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => getLocalStorageValue<T>(key) || initialValue);
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as [T, React.Dispatch<React.SetStateAction<T>>];
}

function getLocalStorageValue<T>(key: string) {
  const existingValue = localStorage.getItem(key);
  if (existingValue) {
    try {
      return JSON.parse(existingValue) as T;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  }
  return null;
}

export function useAuth() {
  const [token, setToken] = useStateLocalStorage('_auth_token_', '');
  let data = null;
  if (token) {
    try {
      data = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      setToken('');
    }
  }
  return { token, data, setToken };
}
