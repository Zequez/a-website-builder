import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { signal, useSignal, useComputed } from '@preact/signals';

type State = {
  config: PageConfig;
  interactingWith: string | null;
};

export type PageConfig = {
  elements: PageElement[];
};

export type PageElement = TextConfig | ImageConfig;

export type TextConfig = {
  uuid: string;
  type: 'Text';
  value: string;
  boxColor: 'none' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'black';
};

export type ImageConfig = {
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
    interactingWith: null,
  });

  function patchState(patch: Partial<State>) {
    state.value = { ...state.value, ...patch };
  }

  function patchConfig(patch: Partial<PageConfig>) {
    patchState({ config: { ...state.value.config, ...patch } });
  }

  function patchPageElement<T extends PageElement>(uuid: string, patch: Partial<T>) {
    patchConfig({
      elements: state.value.config.elements.map((e) =>
        e.uuid === uuid ? ({ ...e, ...patch } as T) : e,
      ),
    });
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

    reportInteraction(uuid: string) {
      patchState({ interactingWith: uuid });
    }

    patchTextElement = patchPageElement<TextConfig>;
    patchImageElement = patchPageElement<ImageConfig>;
  })();

  return { state, computed, actions };
}

const PageContentContext = createContext<ReturnType<typeof usePageContentEditorStoreBase>>(
  undefined!,
);

export const Wrapper = (p: { children: any; init: PageConfig }) => {
  const store = usePageContentEditorStoreBase(p.init);
  return <PageContentContext.Provider value={store}>{p.children}</PageContentContext.Provider>;
};

const usePageContentEditorStore = () => useContext(PageContentContext);

export default usePageContentEditorStore;
