import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { signal, useSignal, effect, useComputed } from '@preact/signals';

type State = {
  config: PageConfig;
  interactingWith: string | null;
  previewLocked: boolean;
  previewPeeking: boolean;
};

function usePageContentEditorStoreBase(
  init: PageConfig,
  onChange: (newConfig: PageConfig) => void,
) {
  const state = useSignal<State>({
    config: init,
    interactingWith: null,
    previewLocked: false,
    previewPeeking: false,
  });

  effect(() => {
    console.log('PageContent state', state.value);
  });

  function patchState(patch: Partial<State>) {
    state.value = { ...state.value, ...patch };
  }

  function patchConfig(patch: Partial<PageConfig>) {
    const newConfig = { ...state.value.config, ...patch };
    patchState({ config: newConfig });
    onChange(newConfig);
  }

  function patchPageElement<T extends PageElementConfig>(uuid: string, patch: Partial<T>) {
    patchConfig({
      elements: state.value.config.elements.map((e) =>
        e.uuid === uuid ? ({ ...e, ...patch } as T) : e,
      ),
    });
  }

  const computed = new (class {
    previewing = useComputed(() => state.value.previewLocked || state.value.previewPeeking);
  })();

  const actions = new (class {
    addElement(type: 'Text' | 'Image') {
      console.log('Adding element', type);
      const newEl: Pick<PageElementConfig, 'type' | 'uuid'> = {
        type,
        uuid: crypto.randomUUID(),
      };

      let specificEl: PageElementConfig;

      if (newEl.type === 'Text') {
        specificEl = { ...newEl, type: 'Text', value: '', compiledValue: '', boxColor: 'none' };
      } else if (newEl.type === 'Image') {
        specificEl = { ...newEl, type: 'Image', url: { large: '', medium: '', small: '' } };
      } else {
        return;
      }

      if (specificEl) {
        patchConfig({ elements: [...state.value.config.elements, specificEl] });
      }
    }

    // setPreview(previewing: boolean) {
    // patchState({ previewing });
    // }

    reportInteraction(uuid: string) {
      patchState({ interactingWith: uuid });
    }

    patchState = patchState;
    patchTextElement = patchPageElement<TextElementConfig>;
    patchImageElement = patchPageElement<ImageElementConfig>;
  })();

  return { state, computed, actions };
}

const PageContentContext = createContext<ReturnType<typeof usePageContentEditorStoreBase>>(
  undefined!,
);

export const Wrapper = (p: {
  children: any;
  init: PageConfig;
  onChange: (newConfig: PageConfig) => void;
}) => {
  const store = usePageContentEditorStoreBase(p.init, p.onChange);
  return <PageContentContext.Provider value={store}>{p.children}</PageContentContext.Provider>;
};

const usePageContentEditorStore = () => useContext(PageContentContext);

export default usePageContentEditorStore;
