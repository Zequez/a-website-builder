import noisePattern from '../../assets/noise.png';

const patterns = {
  noise: noisePattern,
  none: null,
};

export default function PatternPicker(p: {
  pattern: keyof typeof patterns;
  onChangePattern: (pattern: keyof typeof patterns) => void;
  onChangeIntensity: (intensity: number) => void;
  intensity: number;
}) {
  return (
    <div class="flex h-10 w-full">
      <button
        class="h-10 w-10 b-2 flex-shrink-0 b-white/30 rounded-full mr-2"
        onClick={() => {
          p.onChangePattern(nextPattern(p.pattern));
        }}
      >
        <div
          class="w-full h-full rounded-full"
          style={{
            backgroundImage: `url(${patterns[p.pattern]})`,
            opacity: `${p.intensity}%`,
          }}
        ></div>
      </button>
      <input
        class="flex-grow h-full"
        type="range"
        min="0"
        max="20"
        step="1"
        disabled={p.pattern === 'none'}
        value={p.intensity}
        onInput={(e) => p.onChangeIntensity(e.currentTarget.valueAsNumber)}
      />
    </div>
  );
}

function nextPattern(current: keyof typeof patterns): keyof typeof patterns {
  const i = Object.keys(patterns).indexOf(current);
  return Object.keys(patterns)[(i + 1) % Object.keys(patterns).length] as keyof typeof patterns;
}
