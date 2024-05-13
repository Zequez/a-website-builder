import { createContext } from 'preact';
import { useContext, useEffect, useMemo } from 'preact/hooks';
import { signal, useSignal, useSignalEffect, useComputed } from '@preact/signals';
import { debounce } from '@shared/utils';

type State = {
  config: PageConfig;
  focusActivation: string | null;
  previewLocked: boolean;
  previewPeeking: boolean;
};

function usePageContentEditorStoreBase(
  init: PageConfig,
  onChange: (newConfig: PageConfig) => void,
) {
  const state = useSignal<State>({
    config: init,
    focusActivation: null,
    previewLocked: false,
    previewPeeking: false,
  });

  useSignalEffect(() => {
    console.log('PageContent state', state.value);
  });

  function patchState(patch: Partial<State>) {
    state.value = { ...state.value, ...patch };
  }

  function patchConfig(patch: Partial<PageConfig>) {
    const newConfig = { ...state.value.config, ...patch };
    patchState({ config: newConfig });
    debouncedOnChange(newConfig);
  }

  useEffect(() => {
    patchState({ config: init });
  }, [init]);

  const debouncedOnChange = useMemo(() => debounce(onChange, 2000), []);

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

    backDeleteElement(uuid: string) {
      let previousElement: null | string = null;
      const elements = state.value.config.elements.filter((e, i) => {
        if (e.uuid === uuid && i > 0) {
          previousElement = state.value.config.elements[i - 1]!.uuid;
        }
        return e.uuid !== uuid;
      });
      patchState({ config: { ...state.value.config, elements }, focusActivation: previousElement });
    }

    // setPreview(previewing: boolean) {
    // patchState({ previewing });
    // }

    reportInteraction(uuid: string) {
      patchState({ focusActivation: uuid });
    }

    patchState = patchState;
    patchTextElement = patchPageElement<TextElementConfig>;
    patchImageElement = patchPageElement<ImageElementConfig>;

    moveElement(uuid: string, targetUuid: string, direction: 'up' | 'down') {
      const elements = state.value.config.elements;
      const element = elements.find((e) => e.uuid === uuid)!;
      const newElements = elements.filter((e) => e.uuid !== uuid);
      const targetIndex = newElements.findIndex((e) => e.uuid === targetUuid)!;

      if (direction === 'up') {
        newElements.splice(targetIndex, 0, element);
      } else {
        newElements.splice(targetIndex + 1, 0, element);
      }
      patchConfig({ elements: newElements });
    }
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
