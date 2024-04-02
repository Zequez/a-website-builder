import { useCanvasAnimation, randomHue } from '@app/lib/utils';
import { useEffect, useRef } from 'preact/hooks';

export default function PossibilitiesCanvas() {
  const canvasRef = useCanvasAnimation((canvas) => {
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

    const ITEM_HEIGHT = 38;
    const ITEM_FADE_IN_TIME = 0.5;
    type ItemProps = {
      hue: number;
      x: number;
      y: number;
      w: number;
      opacity: number;
      delay: number;
    };

    function renderItem({ hue, x, y, w, opacity }: ItemProps) {
      ctx.fillStyle = `hsla(${hue}, 45%, 75%, ${opacity})`;
      ctx.strokeStyle = `hsla(${hue}, 45%, 60%, ${opacity})`;
      drawRoundedRect(x, y, w, ITEM_HEIGHT, 6);
    }

    const items: ItemProps[] = [];
    for (let i = 0; i < 50; ++i) {
      let x = Math.random() * (width - 100) + 50;
      let y = Math.random() * (height - 40) + 20;
      let w = Math.random() * 90 + 90;
      let opacity = ((i + 1) / 100) * 0.75;
      let delay = Math.random() * 1.5 + 0.25;
      items.push({ hue: randomHue(), x, y, w, opacity, delay });
    }

    let initialTimestamp: number;
    return (timestamp) => {
      if (!initialTimestamp) initialTimestamp = timestamp;
      const timePassed = (timestamp - initialTimestamp) / 1000;
      ctx.clearRect(0, 0, width, height);
      let hasIncompleteItems = false;
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let completion = 0;
        if (timePassed > item.delay + ITEM_FADE_IN_TIME) {
          completion = 1;
        } else if (timePassed > item.delay) {
          completion = (timePassed - item.delay) / ITEM_FADE_IN_TIME;
        }
        if (completion >= 1) {
          renderItem(item);
        } else {
          hasIncompleteItems = true;
          if (completion > 0) {
            renderItem({ ...item, opacity: item.opacity * completion });
          }
        }
      }

      if (!hasIncompleteItems) {
        return false;
      }
    };
  });

  return (
    <div class="absolute top-0 left-0 w-full h-full z-10 overflow-hidden">
      <canvas class="w-full h-full" ref={canvasRef}></canvas>
    </div>
  );
}
