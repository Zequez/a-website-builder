import classnames from 'classnames';
import { sha256 } from 'js-sha256';
import { useEffect, useState } from 'preact/hooks';

export function gravatarUrl(email: string) {
  return `https://www.gravatar.com/avatar/${sha256(email)}?d=identicon`;
}

export const cx = classnames;

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item
        ? JSON.parse(item)
        : typeof initialValue === 'function'
        ? initialValue()
        : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      // ignore
    }
  }, [key, state]);

  return [state, setState] as const;
}
