import marked from '../lib/marked';
import { Editor } from 'tiny-markdown-editor';
import DOMPurify from 'dompurify';

import usePageContentEditorStore from '../lib/usePageContentEditorStore';
import { useEffect, useRef } from 'preact/hooks';

export default function TextEditor(p: { element: TextElementConfig }) {
  const {
    state,
    actions: { patchTextElement, backDeleteElement: deleteElement },
  } = usePageContentEditorStore();

  const elRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor>(null!);

  useEffect(() => {
    if (state.value.focusActivation === p.element.uuid) {
      if (editorRef.current) {
        editorRef.current.setSelection({ col: 0, row: 0 });
      }
    }
  }, [state.value.focusActivation]);

  async function handleChange(value: string) {
    const valueForcedBreaks = value.replace(/\n\n/g, '\n&nbsp;\n');
    const processedMarkdown = await marked(valueForcedBreaks, { gfm: true, breaks: true });
    console.log(processedMarkdown);
    patchTextElement(p.element.uuid, {
      value,
      compiledValue: DOMPurify.sanitize(processedMarkdown, {
        USE_PROFILES: { html: true, svg: true },
      }),
    });
  }

  useEffect(() => {
    const editor = new Editor({ element: elRef.current!, content: p.element.value });
    // @ts-ignore
    editor.setContent(p.element.value);
    editor.setSelection({ col: 0, row: 0 });
    editor.addEventListener('change', () => handleChange(editor.getContent()));
    elRef.current!.addEventListener('keydown', (ev) => {
      if (ev.key === 'Backspace') {
        if (editor.getContent().length === 0) {
          ev.preventDefault();
          deleteElement(p.element.uuid);
        }
      }
    });
    editorRef.current = editor;
  }, []);

  return (
    <div
      ref={elRef}
      class="block w-full outline-none! resize-none bg-transparent py2 line-height-[1rem] text-black/50"
    />
  );
}
