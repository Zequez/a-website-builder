import IconGripVertical from '~icons/fa6-solid/grip-vertical';
import EyeIcon from '~icons/fa6-regular/eye';
import PenIcon from '~icons/fa6-solid/pen';
import usePageContentEditorStore, { Wrapper } from './usePageContentEditorStore';
import { cx } from '@shared/utils';
import TextEditor from './TextEditor';
import ElementPicker from './ElementPicker';
import { Button } from '../ui';
import PageElementsRenderer from './PageElementsRenderer';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useDragState from './useDragState';

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

function PageElementsList() {
  const { state, actions } = usePageContentEditorStore();
  const { dragState, startDrag, containerRef } = useDragState({
    onMoveElement: actions.moveElement,
  });

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
            onDragStart={startDrag}
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
  onDragStart?: (ev: MouseEvent | TouchEvent) => void;
  class?: string;
  dragKey?: string;
  highlight?: boolean;
}) {
  const {
    state,
    actions: { reportInteraction },
  } = usePageContentEditorStore();

  // function handleDragStart(
  //   pos: { clientX: number; clientY: number },
  //   target: HTMLElement,
  //   touch: boolean,
  // ) {
  //   p.onDragStart?.({ x: pos.clientX, y: pos.clientY }, target.parentElement!, touch);
  // }

  return (
    <div class={cx('flex relative', p.class)} data-drag-key={p.dragKey}>
      <div
        class="peer absolute -ml-6 sm:-ml-8 mr-2 bg-main-700 flexcc rounded-sm  b b-black/5 w-4 h-8 hover:bg-main-800 cursor-ns-resize text-white/40"
        onMouseDown={p.onDragStart}
        onTouchStart={p.onDragStart}
        // onMouseDown={(ev) => {
        //   handleDragStart(ev, ev.currentTarget, false);
        // }}
        // onTouchStart={(ev) => {
        //   ev.preventDefault();
        //   handleDragStart(ev.targetTouches[0], ev.currentTarget, true);
        // }}
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
