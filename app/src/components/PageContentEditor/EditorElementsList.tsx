import { cx } from '@shared/utils';
import EditorElementWrapper from './EditorElementWrapper';
import { useMemo } from 'preact/hooks';
import useDragState from './lib/useDragState';
import usePageContentEditorStore from './lib/usePageContentEditorStore';

export default function EditorElementsList() {
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
          <EditorElementWrapper
            key={e.uuid}
            dragKey={e.uuid}
            element={e}
            onDragStart={startDrag}
            class={cx({
              'opacity-0': dragState?.elementId === e.uuid,
              // 'bg-red-500!': dragState?.targetIndex === i,
            })}
          ></EditorElementWrapper>
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
            <EditorElementWrapper element={draggedElement} highlight={true} grabbed={true} />
          </div>
        </>
      )}
    </>
  ) : null;
}
