import { shuffleArray, strToHue, useIsVisible } from '@app/lib/utils';
import PossibilitiesCanvas from './PossibilitiesCanvas';
import { useEffect, useMemo, useRef } from 'preact/hooks';

export default function PossibilitiesCloud({ possibilities }: { possibilities: string[] }) {
  const divRef = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(divRef);

  const shuffledPossibilities = useMemo(() => {
    return shuffleArray(possibilities);
  }, []);

  return (
    <div class="mb-16 bg-slate-700">
      <div class="text-center text-white py-2 bg-gradient-to-b from-white/0 to-white/5 border-b-2 border-black/10">
        <h2
          class="text-3xl opacity-90 uppercase font-semibold tracking-wider"
          style={{ textShadow: '0 2px 0 rgba(0,0,0,0.25)' }}
        >
          Explore Possibilities
        </h2>
        <p class="opacity-50">Collaborating in a system that works for us</p>
      </div>
      <div ref={divRef} class="relative mb-16">
        <div class="w-screen-md mx-auto relative z-20">
          <div class="flex flex-wrap items-center justify-center space-x-4 pt-4 text-xl">
            {shuffledPossibilities.map((p) => (
              <div
                class="bg-black/5 text-white border-1 border-solid px-4 py-1 mb-4 rounded-md shadow-lg"
                style={{
                  backgroundColor: `hsl(${strToHue(p)}, 50%, 60%)`,
                  borderColor: `hsl(${strToHue(p)}, 40%, 50%)`,
                  opacity: 0,
                  animation: isVisible ? 'fade-in 0.5s ease-in forwards' : '',
                  animationDelay: (Math.random() * 2500 + 500) / 1000 + 's',
                  textShadow: '0 1px 0 rgba(0,0,0,0.25)',
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
        {isVisible && <PossibilitiesCanvas />}
      </div>
    </div>
  );
}
