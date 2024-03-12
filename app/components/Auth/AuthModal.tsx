import { useEffect } from 'preact/hooks';
import Auth from './Auth';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  // Call on close when ESC key is pressed
  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div class="fixed inset-0 sm:p-8 z-50">
      <div class="relative z-20 bg-gray-100 shadow-md sm:rounded-md p-4 max-w-2xl mx-auto overflow-hidden">
        <Auth />
        <button
          class="absolute h-8 w-8 flex items-center justify-center text-white top-0 right-0 bg-red-400 rounded-bl-md sm:rounded-tr-md text-2xl font-bold hover:bg-red-500 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
      <div class="absolute inset-0 bg-black opacity-20 z-10" onClick={onClose}></div>
    </div>
  );
}
