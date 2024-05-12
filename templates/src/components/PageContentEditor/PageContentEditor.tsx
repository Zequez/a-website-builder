import IconGripVertical from '~icons/fa6-solid/grip-vertical';
import EyeIcon from '~icons/fa6-solid/eye';
import PenIcon from '~icons/fa6-solid/pen';
import usePageContentEditorStore, {
  Wrapper,
  PageConfig,
  PageElement,
} from './usePageContentEditorStore';
import { cx } from '@shared/utils';
import TextEditor from './TextEditor';
import ElementPicker from './ElementPicker';
import { Button } from '../ui';

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
    <main class="relative max-w-screen-sm mx-auto bg-main-900 rounded-lg px-4 text-black/60">
      <div
        class={cx('py4', {
          hidden: computed.previewing.value,
        })}
      >
        <PageElementsList />
        <ElementPicker />
      </div>
      {computed.previewing.value && <PageElementsRenderer />}
      <Button
        customSize
        class="absolute -right-2 -top-2 h-8 w-8"
        tint="main"
        onClick={() =>
          actions.patchState({ previewLocked: !state.value.previewLocked, previewPeeking: false })
        }
      >
        {state.value.previewLocked ? <PenIcon /> : <EyeIcon />}
      </Button>
    </main>
  );
}

function PageElementsRenderer() {
  const { state } = usePageContentEditorStore();
  return state.value.config.elements.length ? (
    <div class="py4 space-y-2">
      {state.value.config.elements.map((pageEl) =>
        pageEl.type === 'Text' ? (
          <div class="prose" dangerouslySetInnerHTML={{ __html: pageEl.compiledValue }}></div>
        ) : (
          <div>{JSON.stringify(pageEl)}</div>
        ),
      )}
    </div>
  ) : (
    <div class="py4"></div>
  );
}

function PageElementsList() {
  const { state } = usePageContentEditorStore();

  return state.value.config.elements.length ? (
    <div class="space-y-0.5 mb-4">
      {state.value.config.elements.map((e, i) => (
        <PageElementEditor key={i} element={e}></PageElementEditor>
      ))}
    </div>
  ) : null;
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
          <TextEditor element={p.element} onInteract={() => reportInteraction(p.element.uuid)} />
        ) : (
          <ImageEditor element={p.element} onInteract={() => reportInteraction(p.element.uuid)} />
        )}
      </div>
    </div>
  );
}

function ImageEditor(p: { element: PageElement & { type: 'Image' }; onInteract: () => void }) {
  return <div>{JSON.stringify(p.element)}</div>;
}
