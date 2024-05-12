import { marked } from 'marked';
import { Editor } from 'tiny-markdown-editor';

import usePageContentEditorStore, { PageElement } from './usePageContentEditorStore';
import { useEffect, useRef } from 'preact/hooks';

export default function TextEditor(p: {
  element: PageElement & { type: 'Text' };
  onInteract: () => void;
}) {
  const {
    actions: { patchTextElement },
  } = usePageContentEditorStore();

  const elRef = useRef<HTMLDivElement>(null);

  async function handleChange(value: string) {
    patchTextElement(p.element.uuid, {
      value,
      compiledValue: await marked.parse(value, { gfm: true, breaks: true }),
    });
  }

  useEffect(() => {
    const editor = new Editor({ element: elRef.current!, content: p.element.value || 'ars' });
    editor.addEventListener('change', () => handleChange(editor.getContent()));
  }, []);

  return (
    <div
      // onChange={({ currentTarget }) => handleChange(currentTarget.innerText)}
      ref={elRef}
      class="block w-full outline-none! resize-none bg-transparent py2 line-height-[1rem] text-black/50"
      // onFocus={p.onInteract}
    />
  );
}
