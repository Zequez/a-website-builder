import { useEffect, useRef } from 'preact/hooks';

function randomHue() {
  return Math.floor(Math.random() * 360);
}

export default function PossibilitiesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    function renderPossibilities(canvas: HTMLCanvasElement) {
      const ITEM_HEIGHT = 38;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, width, height);

      function drawRoundedRect(
        sx: number,
        sy: number,
        width: number,
        height: number,
        radius: number,
      ) {
        const x = sx - width / 2;
        const y = sy - height / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      function renderItem(hue: number, x: number, y: number, w: number, opacity: number) {
        ctx.fillStyle = `hsla(${hue}, 45%, 75%, ${opacity})`;
        ctx.strokeStyle = `hsla(${hue}, 45%, 60%, ${opacity})`;
        drawRoundedRect(x, y, w, ITEM_HEIGHT, 6);
      }

      for (let i = 0; i < 50; ++i) {
        let x = Math.random() * (width - 100) + 50;
        let y = Math.random() * (height - 40) + 20;
        let w = Math.random() * 90 + 90;
        renderItem(randomHue(), x, y, w, ((i + 1) / 100) * 0.75);
      }
    }
    if (canvasRef.current) renderPossibilities(canvasRef.current);
  }, [canvasRef.current]);

  return <canvas class="absolute top-0 w-full h-full z-10" ref={canvasRef}></canvas>;
}
