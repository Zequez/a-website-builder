import { useRef, useState } from 'preact/hooks';

type DragState = {
  elementId: string;
  elementRect: DOMRect;
  initialMousePos: { x: number; y: number };
  mousePos: { x: number; y: number };
  delta: { x: number; y: number };
  targetIndex: number;
  targetDirection: 'up' | 'down' | 'none';
  targets: Targets;
};

type Targets = { [key: string]: { rect: DOMRect; el: HTMLElement } };

const ATTR = 'data-drag-key';

export default function useDragState(p: {
  onMoveElement: (elementId: string, targetId: string, direction: 'up' | 'down') => void;
}) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function startDrag(ev: TouchEvent | MouseEvent, withholdMs: number = 0) {
    if (ev.cancelable) ev.preventDefault();

    const { touch, pos } = localizedEventToMousePos(ev);

    const targets = getAllTargetsFromContainer(containerRef.current!);

    const targetKey = getTargetKey(ev.currentTarget as HTMLElement);
    const target = targets[targetKey];
    const targetIndex = Object.keys(targets).indexOf(targetKey);

    let dragState: DragState = {
      elementId: targetKey,
      elementRect: target.rect,
      initialMousePos: pos,
      mousePos: pos,
      targets,
      targetIndex,
      targetDirection: 'none',
      delta: { x: 0, y: 0 },
    };

    let cancelled = false;
    setTimeout(() => {
      if (!cancelled) {
        setDragState(dragState);
        addTemporalStyles(targets);
      }
    }, withholdMs);

    function handleMouseUp() {
      cleanUp();

      if (dragState.targetDirection !== 'none') {
        p.onMoveElement(
          dragState.elementId,
          Object.keys(targets)[dragState.targetIndex],
          dragState.targetDirection,
        );
      }
    }

    function cancelDrag() {
      cancelled = true;
      cleanUp();
    }

    function cleanUp() {
      setDragState(null);
      removeTemporalStyles(targets);
      if (touch) {
        window.removeEventListener('touchend', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
      } else {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
      }
    }

    function handleTouchMove(ev: TouchEvent) {
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

    return cancelDrag;
  }

  return { containerRef, dragState, startDrag };
}

function addTemporalStyles(targets: Targets) {
  document.body.style.cursor = 'grabbing';
  Object.values(targets).forEach(({ el }) => {
    el.style.transition = 'transform 0.3s';
  });
}

function removeTemporalStyles(targets: Targets) {
  document.body.style.cursor = '';
  Object.values(targets).forEach(({ el }) => {
    el.style.transform = '';
    el.style.backgroundColor = '';
    el.style.transition = '';
  });
}

function localizedEventToMousePos(ev: MouseEvent | TouchEvent): {
  touch: boolean;
  pos: { x: number; y: number };
} {
  const touch = ev.type === 'touchstart';
  const evClientPos =
    ev.type === 'touchstart' ? (ev as TouchEvent).targetTouches[0] : (ev as MouseEvent);
  const pos = { x: evClientPos.clientX, y: evClientPos.clientY };

  return { touch, pos };
}

// Checks for parent with data-drag-key attribute
function getTargetKey(el: HTMLElement) {
  const elementId = el.getAttribute(ATTR);
  if (elementId === null) {
    if (el.parentElement) {
      return getTargetKey(el.parentElement);
    } else {
      throw `No ${ATTR} attribute was found`;
    }
  } else {
    return elementId;
  }
}

function getAllTargetsFromContainer(el: HTMLDivElement) {
  return Object.fromEntries(
    (Array.from(el.childNodes) as HTMLElement[]).map((el) => {
      return [el.getAttribute('data-drag-key')!, { rect: el.getBoundingClientRect(), el }];
    }),
  );
}
