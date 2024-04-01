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

export const strToHue = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

export function shuffleArray(arr: any[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
