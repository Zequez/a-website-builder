import { useRef, useState } from 'preact/hooks';

type DragState = {
  elementId: string;
  elementRect: DOMRect;
  initialMousePos: { x: number; y: number };
  mousePos: { x: number; y: number };
  delta: { x: number; y: number };
  targetIndex: number;
  targetDirection: 'up' | 'down' | 'none';
  targets: { [key: string]: { rect: DOMRect; el: HTMLElement } };
};

const ATTR = 'data-drag-key';

export default function useDragState(p: {
  onMoveElement: (elementId: string, targetId: string, direction: 'up' | 'down') => void;
}) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function startDrag(ev: TouchEvent | MouseEvent) {
    const touch = ev.type === 'touchstart';
    if (ev.cancelable) ev.preventDefault();
    const evClientPos =
      ev.type === 'touchstart' ? (ev as TouchEvent).targetTouches[0] : (ev as MouseEvent);
    const initialMousePos = { x: evClientPos.clientX, y: evClientPos.clientY };
    function getElementAndKey(el: HTMLElement) {
      const elementId = el.getAttribute(ATTR);
      if (elementId === null) {
        if (el.parentElement) {
          return getElementAndKey(el.parentElement);
        } else {
          throw `No ${ATTR} attribute was found`;
        }
      } else {
        return [el, elementId] as [HTMLElement, string];
      }
    }
    const [refElement, elementId] = getElementAndKey(ev.currentTarget as HTMLElement);

    const elementRect = refElement.getBoundingClientRect();
    const targets = Object.fromEntries(
      (Array.from(containerRef.current!.childNodes) as HTMLElement[]).map((el) => {
        el.style.transition = 'transform 0.3s';
        return [el.getAttribute('data-drag-key')!, { rect: el.getBoundingClientRect(), el }];
      }),
    );
    const targetIndex = Object.keys(targets).indexOf(elementId);

    let dragState: DragState = {
      elementId,
      elementRect,
      initialMousePos,
      mousePos: initialMousePos,
      targets,
      targetIndex,
      targetDirection: 'none',
      delta: { x: 0, y: 0 },
    };

    setDragState(dragState);

    function handleMouseUp() {
      Object.values(dragState.targets).forEach(({ el }) => {
        el.style.transform = '';
        el.style.backgroundColor = '';
        el.style.transition = '';
      });
      containerRef.current!.style.transition = '';
      setDragState(null);
      if (touch) {
        window.removeEventListener('touchend', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
      } else {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
      }

      if (dragState.targetDirection !== 'none') {
        p.onMoveElement(
          dragState.elementId,
          Object.keys(targets)[dragState.targetIndex],
          dragState.targetDirection,
        );
      }
    }

    function handleTouchMove(ev: TouchEvent) {
      // ev.preventDefault();
      handleMove(ev.targetTouches[0]);
    }

    function handleMouseMove(ev: MouseEvent) {
      ev.preventDefault();
      handleMove(ev);
    }

    function handleMove(ev: { clientX: number; clientY: number }) {
      const mousePos = { x: ev.clientX, y: ev.clientY };
      const delta = {
        x: mousePos.x - dragState.initialMousePos.x,
        y: mousePos.y - dragState.initialMousePos.y,
      };
      const newDragState = { ...dragState, mousePos, delta };

      dragState = newDragState;

      let furthestTargetMoved: null | [string, number] = null;

      for (let elId in dragState.targets) {
        const target = dragState.targets[elId];
        const distance = target.rect.top - dragState.elementRect.top;

        if (distance > 0) {
          // Elements below
          // target.el.style.backgroundColor = 'blue';
          const hoverY =
            dragState.delta.y + dragState.elementRect.top + dragState.elementRect.height;
          if (hoverY > target.rect.top + target.rect.height / 2) {
            // Dragged element has moved above this element; move element down
            target.el.style.transform = `translateY(-${dragState.elementRect.height}px)`;
            if (!furthestTargetMoved || furthestTargetMoved[1] < distance) {
              furthestTargetMoved = [elId, distance];
            }
          } else {
            // Do not move element, clear transform
            target.el.style.transform = '';
          }
        } else if (distance < 0) {
          // target.el.style.backgroundColor = 'yellow';
          const hoverY = dragState.delta.y + dragState.elementRect.top;
          // Elements above
          if (hoverY < target.rect.top + target.rect.height / 2) {
            // Dragged element has moved below this element; move element up
            target.el.style.transform = `translateY(${dragState.elementRect.height}px)`;
            if (!furthestTargetMoved || furthestTargetMoved[1] > distance) {
              furthestTargetMoved = [elId, distance];
            }
          } else {
            // Do not move element, clear transform
            target.el.style.transform = '';
          }
        }
      }

      if (furthestTargetMoved) {
        const [id, distance] = furthestTargetMoved;
        dragState.targetIndex = Object.keys(dragState.targets).indexOf(id);
        dragState.targetDirection = distance < 0 ? 'up' : 'down';
      } else {
        dragState.targetIndex = Object.keys(dragState.targets).indexOf(dragState.elementId);
        dragState.targetDirection = 'none';
      }

      setDragState(newDragState);
    }

    if (touch) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  }

  return { containerRef, dragState, startDrag };
}
