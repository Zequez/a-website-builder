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
    <div
      ref={divRef}
      class="bg-black/5 relative border-b-2 border-t-2 border-solid border-black/5 mb-16"
    >
      <div class="w-screen-md mx-auto relative z-20">
        <div class="flex flex-wrap items-center justify-center space-x-4 pt-4 text-xl">
          {shuffledPossibilities.map((p) => (
            <div
              class="bg-black/5 text-white border-1 border-solid px-4 py-1 mb-4 rounded-md shadow-lg"
              style={{
                backgroundColor: `hsl(${strToHue(p)}, 65%, 75%)`,
                borderColor: `hsl(${strToHue(p)}, 65%, 60%)`,
                opacity: 0,
                animation: isVisible ? 'fade-in 0.5s ease-in forwards' : '',
                animationDelay: (Math.random() * 2500 + 500) / 1000 + 's',
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
      {isVisible && <PossibilitiesCanvas />}
    </div>
  );
}
