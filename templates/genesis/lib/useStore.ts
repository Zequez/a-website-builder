import { useEffect, useMemo, useState } from 'preact/hooks';

export default function useStore(initialConfig: Config) {
  const INITIAL_STATE = {
    editing: true,
    savedConfig: { ...initialConfig },
    config: { ...initialConfig },
  };

  const [store, setStoreBase] = useState(INITIAL_STATE);

  function setStore(store: typeof INITIAL_STATE) {
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
    },
  };
}
