import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';

type Store = {
  editing: boolean;
  savedConfig: Config;
  config: Config;
};

export function useStoreBase(initialConfig: Config) {
  const INITIAL_STATE: Store = {
    editing: false,
    savedConfig: { ...initialConfig },
    config: { ...initialConfig },
  };

  const [store, setStoreBase] = useState<Store>(INITIAL_STATE);

  function setStore(store: Store) {
    console.log('setStore', store);
    setStoreBase(store);
  }

  const configChanged = useMemo(() => {
    return JSON.stringify(store.config) !== JSON.stringify(store.savedConfig);
  }, [store]);

  useEffect(() => {
    window.document.title = store.config.title;
  }, [store.config.title]);

  // ACTIONS

  function setConfigVal(key: string, val: any) {
    setStore({ ...store, config: { ...store.config, [key]: val } });
  }

  function saveConfig() {
    setStore({ ...store, savedConfig: store.config });
  }

  function patchPage(path: string, patch: Partial<Page>) {
    setConfigVal(
      'pages',
      store.config.pages.map((page) => {
        if (page.path === path) {
          return { ...page, ...patch };
        } else {
          return page;
        }
      }),
    );
  }

  return {
    store,
    configChanged,
    actions: {
      setConfigVal,
      saveConfig,
      patchPage,
      startEditing: () => setStore({ ...store, editing: true }),
      finishEditing: () => setStore({ ...store, editing: false }),
    },
  };
}

const StoreContext = createContext<ReturnType<typeof useStoreBase>>(undefined!);

export const StoreContextWrapper = ({
  children,
  initialConfig,
}: {
  children: any;
  initialConfig: Config;
}) => {
  const store = useStoreBase(initialConfig);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export default function useStore() {
  return useContext(StoreContext);
}
