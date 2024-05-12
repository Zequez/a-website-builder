import FontIcon from '~icons/fa6-solid/font';
import ImageIcon from '~icons/fa6-solid/image';
import IconGripVertical from '~icons/fa6-solid/grip-vertical';
import usePageContentEditorStore, {
  Wrapper,
  PageConfig,
  PageElement,
} from './usePageContentEditorStore';
import { cx } from '@shared/utils';
import { useEffect, useRef } from 'preact/hooks';

export default function PageContentEditor(p: {
  config: PageConfig;
  onConfigChange: (newConfig: PageConfig) => void;
}) {
  return (
    <Wrapper init={p.config}>
      <PageContentEditorBase onConfigChange={p.onConfigChange} />
    </Wrapper>
  );
}

function PageContentEditorBase(p: { onConfigChange: (newConfig: PageConfig) => void }) {
  const { state, computed, actions } = usePageContentEditorStore();

  return (
    <main class="max-w-screen-sm mx-auto bg-main-900 rounded-lg p-4 text-black/60">
      <PageElementsList />
      <ElementPicker />
    </main>
  );
}

function PageElementsList() {
  const { state } = usePageContentEditorStore();

  return (
    <div class="space-y-0.5 mb-4">
      {state.value.config.elements.map((e, i) => (
        <PageElementEditor key={i} element={e}></PageElementEditor>
      ))}
    </div>
  );
}

function PageElementEditor(p: { element: PageElement }) {
  const {
    state,
    actions: { reportInteraction },
  } = usePageContentEditorStore();

  return (
    <div class="flex relative">
      <div class="peer absolute -ml-8 mr-2 bg-main-700 flexcc rounded-sm  b b-black/5 w-4 h-8 hover:bg-main-800 cursor-ns-resize text-white/40">
        <IconGripVertical />
      </div>
      <div
        class={cx(
          'absolute peer-hover:bg-white/30 h-full -left-4 -right-4 top-0 z-0 pointer-events-none',
          {
            'bg-white/30': state.value.interactingWith === p.element.uuid,
          },
        )}
      ></div>
      <div class="flexcs relative z-10 flex-grow">
        {p.element.type === 'Text' ? (
          <PageTextEditor
            element={p.element}
            onInteract={() => reportInteraction(p.element.uuid)}
          />
        ) : (
          <PageImageEditor
            element={p.element}
            onInteract={() => reportInteraction(p.element.uuid)}
          />
        )}
      </div>
    </div>
  );
}

function PageTextEditor(p: { element: PageElement & { type: 'Text' }; onInteract: () => void }) {
  const {
    actions: { patchTextElement },
  } = usePageContentEditorStore();

  const writeAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    writeAreaRef.current!;
  }, [p.element.value]);

  return (
    <div
      ref={writeAreaRef}
      contentEditable={true}
      value={p.element.value}
      onChange={({ currentTarget }) =>
        patchTextElement(p.element.uuid, { value: currentTarget.innerText })
      }
      class="block w-full outline-none resize-none bg-transparent py2 line-height-[1rem] text-black/50"
      onFocus={p.onInteract}
    />
  );
}

function PageImageEditor(p: { element: PageElement & { type: 'Image' }; onInteract: () => void }) {
  return <div>{JSON.stringify(p.element)}</div>;
}

function ElementPicker(p: {}) {
  const {
    actions: { addElement },
  } = usePageContentEditorStore();
  return (
    <div class="flex space-x-2">
      <ElementPickerButton icon={<FontIcon />} onClick={() => addElement('Text')}>
        Texto
      </ElementPickerButton>
      <ElementPickerButton icon={<ImageIcon />} onClick={() => addElement('Image')}>
        Imagen
      </ElementPickerButton>
    </div>
  );
}

function ElementPickerButton(p: { children: any; icon: any; onClick: () => void }) {
  return (
    <button
      onClick={p.onClick}
      class="group bg-white/50 b b-black/10 b-t-black/5 rounded-md h-20 w1/3 flexcc text-2xl font-light tracking-wider text-black/40 hover:bg-white/80 transition-colors shadow-sm"
    >
      <div class="flexcc group-hover:scale-110 transition-transform">
        <div class="w-12 h-8">{p.icon}</div>
        {p.children}
      </div>
    </button>
  );
}
