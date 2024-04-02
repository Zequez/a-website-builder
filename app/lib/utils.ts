import classnames from 'classnames';
import { sha256 } from 'js-sha256';
import { Ref } from 'preact/hooks';
import { useEffect, useRef, useState } from 'preact/hooks';

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

export function shuffleArray(arr: any[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function useCanvasAnimation(
  setup: (canvas: HTMLCanvasElement) => (timestamp: DOMHighResTimeStamp) => false | void,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let animationId = 0;
    if (canvasRef.current) {
      let updateFun = setup(canvasRef.current);

      function animate(timestamp: DOMHighResTimeStamp) {
        const result = updateFun(timestamp);
        if (result !== false) {
          animationId = requestAnimationFrame(animate);
        }
      }
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [canvasRef.current]);

  return canvasRef;
}

export const useIsVisible = (elementRef: Ref<HTMLElement>, threshold = 0.25) => {
  const [isVisible, setIsVisible] = useState(false);

  const OPTIONS = {
    root: null,
    rootMargin: '0px 0px 0px 0px',
    threshold,
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(elementRef.current!);
        }
      });
    }, OPTIONS);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [elementRef!.current]);

  return isVisible;
};

export const strToHue = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

export function randomHue() {
  return Math.floor(Math.random() * 360);
}
