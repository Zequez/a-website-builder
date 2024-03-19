import { createRef } from 'preact';
import { LocalFile, LocalSite } from './types';

export default function CodePanel({
  site,
  file,
  onChange,
}: {
  site: LocalSite | null;
  file: LocalFile | null;
  onChange: (content: string) => void;
}) {
  const textAreaRef = createRef<HTMLTextAreaElement>();
  function handleKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'Tab') {
      const el = textAreaRef.current;
      if (el) {
        const cursorPosition = el.selectionStart;
        const textBeforeCursor = el.value.substring(0, cursorPosition);
        const textAfterCursor = el.value.substring(cursorPosition);
        const newValue = textBeforeCursor + '  ' + textAfterCursor;
        el.value = newValue;
        el.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
        onChange(newValue);
      }
      ev.preventDefault();
    }
  }

  return file ? (
    <textarea
      class={'flex-grow p-4 bg-gray-700 text-white font-mono outline-none focus:bg-gray-600'}
      value={file.content}
      onChange={({ currentTarget }) => onChange(currentTarget.value)}
      onKeyDown={handleKeyDown}
      ref={(el) => {
        el?.focus();
        textAreaRef.current = el;
      }}
    ></textarea>
  ) : (
    <div class="flex flex-grow items-center justify-center text-2xl text-gray-200 opacity-50">
      {site ? 'No file open' : 'No site selected'}
    </div>
  );
}
