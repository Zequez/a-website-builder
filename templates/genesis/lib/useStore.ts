import { useEffect, useMemo, useState } from 'preact/hooks';

export default function useStore(initialConfig: Config) {
  const INITIAL_STATE = {
    savedConfig: { ...initialConfig },
    config: { ...initialConfig },
  };

  const [store, setStore] = useState(INITIAL_STATE);

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

  return {
    store,
    configChanged,
    actions: {
      setConfigVal,
      saveConfig,
    },
  };
}
