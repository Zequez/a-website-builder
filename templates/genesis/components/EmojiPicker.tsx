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

  return createPortal(
    <div class="fixed inset-0 z-50">
      <div
        class="absolute z-20 h-80 w-90 bg-white shadow-md rounded-md overflow-hidden"
        style={{
          left: left + width,
          top: top,
        }}
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
