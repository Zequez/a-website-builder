import IconGripVertical from '~icons/fa6-solid/grip-vertical';
import { useRef, useState } from 'preact/hooks';
import usePageContentEditorStore from './lib/usePageContentEditorStore';
import { cx } from '@shared/utils';
import FloatingMenu from '../ui/FloatingMenu';
import TextEditor from './elements/TextEditor';
import ImageEditor from './elements/ImageEditor';

export default function EditorElementWrapper(p: {
  element: PageElementConfig;
  onDragStart?: (ev: MouseEvent | TouchEvent, withholdMs: number) => () => void;
  class?: string;
  dragKey?: string;
  highlight?: boolean;
  grabbed?: boolean;
}) {
  const {
    state,
    actions: { removeElement },
  } = usePageContentEditorStore();

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handledAs = useRef<'idle' | 'unknown' | 'click' | 'drag'>();

  function maybeDragStart(ev: MouseEvent | TouchEvent) {
    if (p.onDragStart) {
      const cancel = p.onDragStart(ev, 150);

      handledAs.current = 'unknown';
      function checkMouseMove() {
        if (handledAs.current === 'unknown') {
          handledAs.current = 'drag';
        }
      }

      function maybeHandleAsClick() {
        if (handledAs.current === 'unknown') {
          handledAs.current = 'click';
          setMenuOpen(true);
          cancel();
        } else {
          handledAs.current = 'idle';
        }
      }

      window.addEventListener('mousemove', checkMouseMove);
      window.addEventListener('mouseup', maybeHandleAsClick);
      window.addEventListener('touchend', maybeHandleAsClick);

      setTimeout(() => {
        window.removeEventListener('mousemove', checkMouseMove);
        window.removeEventListener('mouseup', maybeHandleAsClick);
        window.removeEventListener('touchend', maybeHandleAsClick);

        handledAs.current = 'idle';
      }, 150);
    }
  }

  return (
    <div class={cx('flex relative', p.class)} data-drag-key={p.dragKey}>
      <button
        class={cx(
          `peer absolute z-30 flexcc
          w-6 h-8 -ml-6 sm:-ml-8 mr-2
          bg-main-700  b b-black/5 hover:bg-main-800 text-white/40 rounded-sm`,
          {
            'cursor-grabbing!': p.grabbed,
            'cursor-grab': !p.grabbed,
          },
        )}
        ref={menuButtonRef}
        onMouseDown={maybeDragStart}
        onTouchStart={maybeDragStart}
      >
        <IconGripVertical />
      </button>
      {menuOpen ? (
        <FloatingMenu
          side="right"
          position="right"
          items={{
            Eliminar: () => {
              removeElement(p.element.uuid);
            },
          }}
          target={menuButtonRef.current!}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
      <div
        class={cx(
          'absolute z-20 peer-hover:bg-white/30 h-full -left-4 -right-4 top-0 z-0 pointer-events-none',
          {
            'bg-white/30': state.value.focusActivation === p.element.uuid || p.highlight,
          },
        )}
      ></div>
      <div class="flexcs relative z-10 flex-grow max-w-full pl2 sm:pl0">
        {p.element.type === 'Text' ? (
          <TextEditor element={p.element} />
        ) : (
          <ImageEditor element={p.element} />
        )}
      </div>
    </div>
  );
}
