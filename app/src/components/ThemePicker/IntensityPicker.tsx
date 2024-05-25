import { useEffect, useRef } from 'preact/hooks';

export default function IntenstityPicker(p: { value: number; onChange: (value: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    drawSineWave(ctx, 8, p.value);
  }, [p.value]);

  return (
    <div class="relative h-20 flex items-center w-full">
      <canvas class="absolute z-10 w-full h-full" ref={canvasRef}></canvas>
      <input
        class="w-full relative h-20 z-20 active:opacity-50"
        type="range"
        min="0"
        max="100"
        step="1"
        value={p.value}
        onInput={(e) => p.onChange(e.currentTarget.valueAsNumber)}
      />
    </div>
  );
}

function drawSineWave(ctx: CanvasRenderingContext2D, crests: number, amplitude: number) {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  const remappedAmplitude = (amplitude / 100) * 0.7 + 0.3;

  // const minAmplitude = (canvasHeight / 2) * 0.1;
  const maxAmplitude = Math.max((canvasHeight / 2) * remappedAmplitude - 4, 0);

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const startY = canvasHeight / 2;

  ctx.beginPath();
  for (let x = 0; x <= canvasWidth; x++) {
    // Calculate the corresponding y-coordinate based on sine function
    const y = startY + maxAmplitude * Math.sin((crests * x * Math.PI) / canvasWidth);

    // Draw line to each point
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#fff7';
  ctx.stroke();
  ctx.closePath();
}
