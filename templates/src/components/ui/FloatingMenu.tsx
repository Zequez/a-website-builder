import { useEffect, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { adjustRectToDocument, rectangleToStyle } from '../../lib/floatingRectangle';

export default function FloatingMenu(p: {
  target: HTMLElement;
  items: { [key: string]: () => void };
  onClose: () => void;
  side?: 'left' | 'right';
  position?: 'left' | 'right';
  spacing?: number;
}) {
  const { left, top, width, height } = p.target.getBoundingClientRect();
  const floatingMenuContainer = document.getElementById('floating-menus')!;
  const clickEnabled = useRef(false);

  const docDimensions = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };

  useEffect(() => {
    setTimeout(() => {
      clickEnabled.current = true;
    }, 200);
  }, []);

  // const rectangle = adjustRectToDocument(
  //   {
  //     left: left + width + 8,
  //     top: top,
  //     width: 360,
  //     height: 300,
  //     scale: 1,
  //   },
  //   documentDimensions,
  // );

  const c = {
    side: p.side || 'right',
    position: p.position || 'right',
    spacing: p.spacing || 0,
  };

  const styleLeft = c.side === 'left' ? left : left + width;

  const style =
    p.position === 'left'
      ? {
          right: docDimensions.width - styleLeft + c.spacing,
          top,
        }
      : {
          left: styleLeft + c.spacing,
          top,
        };

  function handleClick(selectHandler: () => void) {
    if (clickEnabled.current) {
      p.onClose();
      selectHandler();
    }
  }

  function handleClose() {
    if (clickEnabled.current) {
      p.onClose();
    }
  }

  return createPortal(
    <div class="fixed inset-0 z-50">
      <div
        class="absolute z-20 flex flex-col py-1 bg-main-950 text-gray-600 shadow-md rounded-sm overflow-hidden"
        style={style}
      >
        {Object.entries(p.items).map(([item, selectHandler]) => (
          <button
            class="px-2 py-1 hover:bg-gray-300 text-left"
            onClick={handleClick.bind(null, selectHandler)}
          >
            {item}
          </button>
        ))}
      </div>
      <div class="absolute z-10 w-full h-full bg-black/0" onClick={handleClose}></div>
    </div>,
    floatingMenuContainer,
  );
}
