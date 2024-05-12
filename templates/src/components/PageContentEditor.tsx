import FontIcon from '~icons/fa6-solid/font';
import ImageIcon from '~icons/fa6-solid/image';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { signal, useSignal, useComputed } from '@preact/signals';

type State = {
  config: PageConfig;
};

type PageConfig = {
  elements: PageElement[];
};

type PageElement = TextConfig | ImageConfig;

type TextConfig = {
  uuid: string;
  type: 'Text';
  value: string;
  boxColor: 'none' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'black';
};

type ImageConfig = {
  uuid: string;
  type: 'Image';
  url: {
    large: string;
    medium: string;
    small: string;
  };
};

function usePageContentEditorStoreBase(init: PageConfig) {
  const state = useSignal<State>({
    config: init,
  });

  function patchState(patch: Partial<State>) {
    state.value = { ...state.value, ...patch };
  }

  function patchConfig(patch: Partial<PageConfig>) {
    patchState({ config: { ...state.value.config, ...patch } });
  }

  const computed = new (class {})();

  const actions = new (class {
    addElement(type: 'Text' | 'Image') {
      console.log('Adding element', type);
      const newEl: Pick<PageElement, 'type' | 'uuid'> = {
        type,
        uuid: crypto.randomUUID(),
      };

      let specificEl: PageElement;

      if (newEl.type === 'Text') {
        specificEl = { ...newEl, type: 'Text', value: '', boxColor: 'none' };
      } else if (newEl.type === 'Image') {
        specificEl = { ...newEl, type: 'Image', url: { large: '', medium: '', small: '' } };
      } else {
        return;
      }

      if (specificEl) {
        patchConfig({ elements: [...state.value.config.elements, specificEl] });
      }
    }
  })();

  return { state, computed, actions };
}

export default function PageContentEditor(p: {
  config: PageConfig;
  onConfigChange: (newConfig: PageConfig) => void;
}) {
  return (
    <PageContentContextWrapper init={p.config}>
      <PageContentEditorBase onConfigChange={p.onConfigChange} />
    </PageContentContextWrapper>
  );
}

function PageContentEditorBase(p: { onConfigChange: (newConfig: PageConfig) => void }) {
  const { state, computed, actions } = usePageContentEditorStore();

  return (
    <div>
      {state.value.config.elements.map((e, i) => (
        <div key={i}>{e.type} aaa</div>
      ))}
      <ElementPicker />
    </div>
  );
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

const PageContentContext = createContext<ReturnType<typeof usePageContentEditorStoreBase>>(
  undefined!,
);

const PageContentContextWrapper = (p: { children: any; init: PageConfig }) => {
  const store = usePageContentEditorStoreBase(p.init);
  return <PageContentContext.Provider value={store}>{p.children}</PageContentContext.Provider>;
};

const usePageContentEditorStore = () => useContext(PageContentContext);
