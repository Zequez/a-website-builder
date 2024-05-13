import useStore from '../lib/useStore';
import noiseImg from '../assets/noise.png';
import { useEffect, useRef } from 'preact/hooks';

export default function TexturePattern() {
  const { store } = useStore();
  const {
    config: { theme },
  } = store;
  const elRef = useRef<HTMLDivElement>(null);

  // I gave up trying to work it with CSS
  useEffect(() => {
    elRef.current!.style.height = elRef.current!.parentElement!.scrollHeight + 'px';
  }, [store]);

  return (
    <div
      class="absolute w-full h-full top-0 left-0 z-0 pointer-events-none opacity-20"
      ref={elRef}
      style={{
        backgroundImage: theme.pattern === 'noise' ? `url(${noiseImg})` : null,
        opacity: `${theme.patternIntensity}%`,
      }}
    ></div>
  );
}
