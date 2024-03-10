import { createPortal } from 'preact/compat';

export default function FloatingMenu({
  items,
  target,
  onClose,
}: {
  target: HTMLElement;
  items: { [key: string]: () => void };
  onClose: () => void;
}) {
  const { left, top, width, height } = target.getBoundingClientRect();
  const floatingMenuContainer = document.getElementById('floating-menus')!;
  return createPortal(
    <div class="fixed inset-0 z-50">
      <div
        class="absolute z-20 flex flex-col py-1 bg-white text-gray-600 shadow-md rounded-sm overflow-hidden"
        style={{
          left: left + width,
          top: top,
        }}
      >
        {Object.entries(items).map(([item, selectHandler]) => (
          <button
            class="px-2 py-1 hover:bg-gray-300 text-left"
            onClick={() => {
              onClose();
              selectHandler();
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div class="absolute z-10 w-full h-full bg-black/0" onClick={onClose}></div>
    </div>,
    floatingMenuContainer,
  );
}
