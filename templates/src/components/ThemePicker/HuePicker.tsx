import { cx } from '@shared/utils';
import { useEffect, useRef, useState } from 'preact/hooks';

export default function HuePicker(p: { value: number; onChange: (value: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragStartHue, setDragStartHue] = useState<number>(p.value);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [maxMovement, setMaxMovement] = useState(0);

  useEffect(() => {
    if (!dragStartX) return;

    const rootEl = document.querySelector<HTMLElement>(':root')!;

    let latestTranslateX = translateX;
    function handleMouseMove(ev: MouseEvent) {
      latestTranslateX = clampTranslateX(ev.clientX - dragStartX!, maxMovement);
      setTranslateX(latestTranslateX);
      // p.onChange(newHueFromTranslate(maxMovement, latestTranslateX, p.value));
    }

    // function handleTouchMove(ev: TouchEvent) {
    //   console.log('Touch', ev);
    // }

    function handleMouseUp() {
      setDragStartX(null);
      // Better performance than updating it on move
      p.onChange(newHueFromTranslate(maxMovement, latestTranslateX, p.value) % 360);
      setTranslateX(0);
    }

    rootEl.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    // window.addEventListener('touchmove', handleTouchMove);

    return () => {
      rootEl.style.userSelect = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
      // window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [dragStartX]);

  function handleMouseDown(ev: MouseEvent) {
    handleStart(ev.clientX);
  }

  function handleTouchStart(ev: TouchEvent) {
    handleStart(ev.touches[0].clientX);
  }

  function handleStart(clientX: number) {
    setDragStartX(clientX);
    setDragStartHue(p.value);
    const cR = containerRef.current!.getBoundingClientRect();
    const sR = sliderRef.current!.getBoundingClientRect();
    setMaxMovement((cR.width - sR.width) / 2 + 1);
  }

  const newHue = dragStartX ? newHueFromTranslate(maxMovement, translateX, dragStartHue) : p.value;

  return (
    <div
      class="w-full h-10 rounded-md relative touch-none"
      ref={containerRef}
      style={{
        backgroundImage: generateSpectrumGradientWithHueCenter(dragStartX ? dragStartHue : p.value),
      }}
    >
      <div
        class={cx('h-full w-8 absolute left-1/2 cursor-ew-resize -ml-4', {
          'transition-transform': !dragStartX,
        })}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        ref={sliderRef}
      >
        <div
          class={cx(
            'h-full w-full rounded-md cursor-ew-resize b b-black/20 hover:scale-110 transition-transform',
            {
              'scale-110': dragStartX,
            },
          )}
          style={{
            backgroundColor: `hsl(${newHue}, 100%, 50%)`,
          }}
        ></div>
      </div>
    </div>
  );
}

function clampTranslateX(translateX: number, maxTranslateX: number) {
  return Math.min(Math.max(translateX, -maxTranslateX), maxTranslateX);
}

function generateSpectrumGradientWithHueCenter(hue: number): string {
  // const stops = 3;
  // Calculate hue values for the gradient stops
  const toHsl = (v: number) => `hsl(${v}, 100%, 50%)`;

  const huesLeft = [-180, -135, -90, -45].map((v) => (hue + v + 360) % 360).map(toHsl);
  const huesRight = [45, 90, 135, 180].map((v) => (hue + v + 360) % 360).map(toHsl);

  const hueCenter = toHsl(hue);

  // Construct the linear gradient background image value
  const backgroundImage = `linear-gradient(to right, ${huesLeft.join(',')}, ${hueCenter}, ${huesRight.join(',')})`;

  return backgroundImage;
}

function newHueFromTranslate(maxTranslateX: number, translateX: number, currentHue: number) {
  const delta = translateX / maxTranslateX;
  const newHue = (currentHue + delta * 180) % 360;
  return newHue;
}
