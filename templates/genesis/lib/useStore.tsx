import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import * as pipes from '../lib/pipes';

type Store = {
  editing: boolean;
  settingsMenuOpen: boolean;
  selectedPageId: null | string;
  siteId: null | string;
  accessKey: string | null;
  savedConfig: Config;
  config: Config;
  subdomainAvailabilityStatus: 'unknown' | 'available' | 'taken';
};

export function useStoreBase(initialConfig: Config, siteId: string | null, editing: boolean) {
  const INITIAL_STATE: Store = {
    editing: editing,

    selectedPageId: initialConfig.pages[0].uuid,
    siteId: siteId,
    accessKey: null,

    //
    savedConfig: { ...initialConfig },
    config: { ...initialConfig },

    //
    subdomainAvailabilityStatus: 'available',

    //
    settingsMenuOpen: false,
  };

  const [store, setStoreBase] = useState<Store>(INITIAL_STATE);

  function setStore(store: Store) {
    console.log('setStore', store);
    setStoreBase(store);
  }

  function patchStore(patch: Partial<Store>) {
    setStore({ ...store, ...patch });
  }

  const configChanged = useMemo(() => {
    return JSON.stringify(store.config) !== JSON.stringify(store.savedConfig);
  }, [store]);

  // COMPUTED

  const navPages = useMemo(() => {
    return store.config.pages.filter((page) => page.onNav);
  }, [store.config.pages]);

  const hiddenPages = useMemo(() => {
    return store.config.pages.filter((page) => !page.onNav);
  }, [store.config.pages]);

  const subdomainChanged = useMemo(() => {
    return store.config.subdomain !== store.savedConfig.subdomain;
  }, [store.config.subdomain, store.savedConfig.subdomain]);

  // EFFECTS

  useEffect(() => {
    window.document.title = store.config.title;
  }, [store.config.title]);

  useEffect(() => {
    if (store.siteId) {
      if (store.config.subdomain !== store.savedConfig.subdomain) {
        patchStore({ subdomainAvailabilityStatus: 'unknown' });
        pipes
          .checkSubdomainAvailability({ subdomain: store.config.subdomain, siteId: store.siteId })
          .then((status) => {
            patchStore({ subdomainAvailabilityStatus: status ? 'available' : 'taken' });
          });
      }
    }
  }, [store.config.subdomain, store.savedConfig.subdomain, store.siteId]);

  // useEffect(() => {
  //   if (store.siteId && store.editing) {
  //     pipes
  //       .tsite({ siteId: store.siteId, props: ['config', 'subdomain', 'domain'] })
  //       .then((tsite) => {
  //         patchStore({ loadedSiteData: tsite });
  //       });
  //   }
  // }, [store.siteId, store.editing]);

  // ACTIONS

  function setConfigVal(key: string, val: any) {
    patchStore({ config: { ...store.config, [key]: val } });
  }

  function saveConfig() {
    patchStore({ savedConfig: store.config });
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

  function addPage() {
    const uuid = crypto.randomUUID();
    setConfigVal(
      'pages',
      store.config.pages.concat({
        uuid,
        path: '/' + uuid,
        title: '',
        icon: '',
        onNav: false,
        content: '',
      }),
    );
  }

  function toggleSettingsMenu() {
    patchStore({ settingsMenuOpen: !store.settingsMenuOpen });
  }

  return {
    store,
    configChanged,
    navPages,
    hiddenPages,
    subdomainChanged,
    actions: {
      setConfigVal,
      saveConfig,
      patchPage,
      startEditing: () => setStore({ ...store, editing: true }),
      finishEditing: () => setStore({ ...store, editing: false, settingsMenuOpen: false }),
      toggleSettingsMenu,
      addPage,
    },
  };
}

const StoreContext = createContext<ReturnType<typeof useStoreBase>>(undefined!);

export const StoreContextWrapper = ({
  children,
  initialConfig,
  siteId,
  editing,
}: {
  children: any;
  initialConfig: Config;
  siteId: string | null;
  editing: boolean;
}) => {
  const store = useStoreBase(initialConfig, siteId, editing);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export default function useStore() {
  return useContext(StoreContext);
}
