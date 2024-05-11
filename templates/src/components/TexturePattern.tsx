import useStore from '../lib/useStore';
import noiseImg from '../assets/noise.png';

export default function TexturePattern() {
  const {
    store: {
      config: { theme },
    },
  } = useStore();
  return (
    <div
      class="absolute inset-0 z-0 pointer-events-none opacity-20"
      style={{
        backgroundImage: theme.pattern === 'noise' ? `url(${noiseImg})` : null,
        opacity: `${theme.patternIntensity}%`,
      }}
    ></div>
  );
}
