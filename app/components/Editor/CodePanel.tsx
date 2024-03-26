import { createRef } from 'preact';
import { LocalFile, LocalSite } from './types';

import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { indentWithTab } from '@codemirror/commands';
import { EditorState, Extension } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { parseMixed } from '@lezer/common';
import { html, htmlLanguage } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { yaml } from '@codemirror/lang-yaml';
import { barf } from 'thememirror';

import { useEffect, useRef } from 'preact/hooks';

export default function CodePanel({
  site,
  file,
  onChange,
}: {
  site: LocalSite | null;
  file: LocalFile | null;
  onChange: (content: string) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustContainerWidth = () => {
      if (divRef.current) {
        const { width } = divRef.current.parentElement!.getBoundingClientRect();
        divRef.current.style.width = width + 'px';
      }
    };
    adjustContainerWidth();
    window.addEventListener('resize', adjustContainerWidth);
    return () => {
      window.removeEventListener('resize', adjustContainerWidth);
    };
  }, [divRef.current]);

  useEffect(() => {
    let view: EditorView;
    if (divRef.current && file) {
      divRef.current.parentElement?.getBoundingClientRect();
      const onUpdate = (update: ViewUpdate) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      };
      const extensions: Extension[] = [
        basicSetup,
        keymap.of(defaultKeymap),
        keymap.of([indentWithTab]),
        barf,
      ];

      if (file.name.match(/\.[jt]sx?$/) || file.name.endsWith('.html')) {
        extensions.push(javascript({ typescript: true, jsx: true }));
      } else if (file.name.endsWith('.css')) {
        extensions.push(css());
      } else if (file.name.endsWith('.yaml')) {
        extensions.push(yaml());
      }

      extensions.push(EditorView.updateListener.of(onUpdate));

      const state = EditorState.create({
        doc: file.content,
        extensions,
      });

      view = new EditorView({
        state,
        parent: divRef.current,
      });

      view.focus();
    }
    return () => {
      view?.destroy();
    };
  }, [divRef, file?.id]);

  return file ? (
    <div
      ref={divRef}
      class="flex-grow flex flex-row w-0 overflow-y-auto bg-gray-700 text-white font-mono outline-none focus:bg-gray-600"
    ></div>
  ) : (
    <div class="flex flex-grow items-center justify-center text-2xl text-gray-200 opacity-50">
      {site ? 'No file open' : 'No site selected'}
    </div>
  );
}
