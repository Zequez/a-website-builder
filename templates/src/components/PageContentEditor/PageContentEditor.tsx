import IconGripVertical from '~icons/fa6-solid/grip-vertical';
import EyeIcon from '~icons/fa6-regular/eye';
import PenIcon from '~icons/fa6-solid/pen';
import usePageContentEditorStore, { Wrapper } from './usePageContentEditorStore';
import { cx } from '@shared/utils';
import TextEditor from './TextEditor';
import ElementPicker from './ElementPicker';
import { Button } from '../ui';
import { effect } from '@preact/signals';
import PageElementsRenderer from './PageElementsRenderer';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

export default function PageContentEditor(p: {
  config: PageConfig;
  onConfigChange: (newConfig: PageConfig) => void;
}) {
  return (
    <Wrapper init={p.config} onChange={p.onConfigChange}>
      <PageContentEditorBase />
    </Wrapper>
  );
}

function PageContentEditorBase() {
  const { state, computed, actions } = usePageContentEditorStore();

  // effect(() => {
  //   p.onConfigChange(state.value.config);
  // });

  return (
    <main class="relative max-w-screen-sm mx-auto bg-main-900 rounded-lg px-4 text-black/60">
      <div
        class={cx('py4', {
          hidden: computed.previewing.value,
        })}
      >
        <PageElementsList />
        <ElementPicker />
      </div>
      {computed.previewing.value && <PageElementsRenderer elements={state.value.config.elements} />}
      <Button
        customSize
        class="absolute -right-1 -top-1 h-8 w-8"
        tint="main"
        onClick={() =>
          actions.patchState({ previewLocked: !state.value.previewLocked, previewPeeking: false })
        }
      >
        {state.value.previewLocked ? <PenIcon /> : <EyeIcon />}
      </Button>
    </main>
  );
}

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

function PageElementsList() {
  const { state, actions } = usePageContentEditorStore();
  const [dragState, setDragState] = useState<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleDragStart(
    elementId: string,
    initialMousePos: { x: number; y: number },
    refElement: HTMLElement,
    touch: boolean,
  ) {
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
        actions.moveElement(
          dragState.elementId,
          Object.keys(targets)[dragState.targetIndex],
          dragState.targetDirection,
        );
      }
    }

    function handleTouchMove(ev: TouchEvent) {
      ev.preventDefault();
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

  const draggedElement = useMemo(() => {
    if (!dragState?.elementId) return null;
    return state.value.config.elements.find((e) => e.uuid === dragState.elementId);
  }, [dragState?.elementId, state.value.config.elements]);

  return state.value.config.elements.length ? (
    <>
      <div class="space-y-0.5 mb-4" ref={containerRef}>
        {state.value.config.elements.map((e, i) => (
          <PageElementEditor
            key={e.uuid}
            dragKey={e.uuid}
            element={e}
            onDragStart={(mousePos, refElement, touch) =>
              handleDragStart(e.uuid, mousePos, refElement, touch)
            }
            class={cx({
              'opacity-0': dragState?.elementId === e.uuid,
              // 'bg-red-500!': dragState?.targetIndex === i,
            })}
          ></PageElementEditor>
        ))}
      </div>
      {dragState && draggedElement && (
        <>
          <div
            class="fixed z-100"
            style={{
              top: dragState.elementRect.top,
              left: dragState.elementRect.left,
              transform: `translateX(${(dragState.delta.x, 0)}px) translateY(${dragState.delta.y}px)`,
              width: dragState.elementRect.width,
              height: dragState.elementRect.height,
            }}
          >
            <PageElementEditor element={draggedElement} highlight={true} />
          </div>
        </>
      )}
    </>
  ) : null;
}

function PageElementEditor(p: {
  element: PageElementConfig;
  onDragStart?: (mousePos: { x: number; y: number }, element: HTMLElement, touch: boolean) => void;
  class?: string;
  dragKey?: string;
  highlight?: boolean;
}) {
  const {
    state,
    actions: { reportInteraction },
  } = usePageContentEditorStore();

  function handleDragStart(
    pos: { clientX: number; clientY: number },
    target: HTMLElement,
    touch: boolean,
  ) {
    p.onDragStart?.({ x: pos.clientX, y: pos.clientY }, target.parentElement!, touch);
  }

  return (
    <div class={cx('flex relative', p.class)} data-drag-key={p.dragKey}>
      <div
        class="peer absolute -ml-8 mr-2 bg-main-700 flexcc rounded-sm  b b-black/5 w-4 h-8 hover:bg-main-800 cursor-ns-resize text-white/40"
        onMouseDown={(ev) => {
          handleDragStart(ev, ev.currentTarget, false);
        }}
        onTouchStart={(ev) => {
          ev.preventDefault();
          handleDragStart(ev.targetTouches[0], ev.currentTarget, true);
        }}
      >
        <IconGripVertical />
      </div>
      <div
        class={cx(
          'absolute peer-hover:bg-white/30 h-full -left-4 -right-4 top-0 z-0 pointer-events-none',
          {
            'bg-white/30': state.value.interactingWith === p.element.uuid || p.highlight,
          },
        )}
      ></div>
      <div class="flexcs relative z-10 flex-grow">
        {p.element.type === 'Text' ? (
          <TextEditor element={p.element} onInteract={() => reportInteraction(p.element.uuid)} />
        ) : (
          <ImageEditor element={p.element} onInteract={() => reportInteraction(p.element.uuid)} />
        )}
      </div>
    </div>
  );
}

function ImageEditor(p: {
  element: PageElementConfig & { type: 'Image' };
  onInteract: () => void;
}) {
  return <div>{JSON.stringify(p.element)}</div>;
}
