import { createPortal } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';
import 'emoji-picker-element';
import { Picker } from 'emoji-picker-element';
import es from 'emoji-picker-element/i18n/es';

export default function EmojiPicker(p: {
  target: HTMLElement;
  onClose: () => void;
  onSelect: (val: string) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const { left, top, width, height } = p.target.getBoundingClientRect();
  const floatingMenuContainer = document.getElementById('floating-menus')!;

  useEffect(() => {
    const picker = new Picker({
      i18n: es,
    });
    picker.style.width = '100%';
    picker.style.height = '100%';
    elRef.current!.appendChild(picker);
    picker.addEventListener('emoji-click', (ev: any) => {
      p.onSelect(ev.detail.unicode);
    });
  }, []);

  const documentDimensions = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };

  const rectangle = adjustRectangleToFitOnDocument(
    {
      left: left + width + 8,
      top: top,
      width: 360,
      height: 300,
      scale: 1,
    },
    documentDimensions,
  );

  return createPortal(
    <div class="fixed inset-0 z-50">
      <div
        class="absolute z-20 bg-white shadow-md rounded-md overflow-hidden"
        style={rectangleToStyle(rectangle)}
        ref={elRef}
      >
        {/* <emoji-picker style={{ width: '100%', height: '100%' }} ref={elRef}></emoji-picker> */}
      </div>
      <div
        class="absolute z-10 w-full h-full bg-black/0"
        onClick={() => {
          if (!navigator.maxTouchPoints) {
            p.onClose();
          }
        }}
        onTouchEnd={() => {
          // Gotta add this because the drag-and-drop polyfill seems to cause some weird bug
          p.onClose();
        }}
      ></div>
    </div>,
    floatingMenuContainer,
  );
}

type Rectangle = { width: number; height: number; top: number; left: number; scale: number };

function adjustRectangleToFitOnDocument(
  rectangle: Rectangle,
  docDimensions: { width: number; height: number },
): Rectangle {
  const newRectangle = { ...rectangle };

  if (rectangle.width > docDimensions.width) {
    newRectangle.scale = docDimensions.width / rectangle.width;
  }

  const finalWidth = rectangle.width * newRectangle.scale;
  const finalHeight = rectangle.height * newRectangle.scale;

  // Calculate the right and bottom edges of the rectangle
  const rightEdge = newRectangle.left + finalWidth;
  const bottomEdge = newRectangle.top + finalHeight;

  // Adjust left position if the rectangle goes off the left side of the document
  if (newRectangle.left < 0) {
    newRectangle.left = 0; // Set to the minimum left position
  }

  // Adjust top position if the rectangle goes off the top of the document
  if (newRectangle.top < 0) {
    newRectangle.top = 0; // Set to the minimum top position
  }

  // Adjust left position if the right edge of the rectangle goes off the right side of the document
  if (rightEdge > docDimensions.width) {
    newRectangle.left -= rightEdge - docDimensions.width; // Move left to fit within the document width
  }

  // Adjust top position if the bottom edge of the rectangle goes below the bottom of the document
  if (bottomEdge > docDimensions.height) {
    newRectangle.top -= bottomEdge - docDimensions.height; // Move up to fit within the document height
  }

  return newRectangle;
}

function rectangleToStyle(rect: Rectangle) {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    transform: `scale(${rect.scale})`,
    transformOrigin: 'top left',
  };
}
