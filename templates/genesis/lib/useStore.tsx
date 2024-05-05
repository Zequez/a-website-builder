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

type StoreInit = {
  config: Config;
  siteId: string | null;
  editing: boolean;
  selectedPageId: string | null;
};

export function useStoreBase(init: StoreInit) {
  const INITIAL_STATE: Store = {
    editing: init.editing,

    selectedPageId: init.config.pages[0].uuid,
    siteId: init.siteId,
    accessKey: null,

    //
    savedConfig: { ...init.config },
    config: { ...init.config },

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

  //  ██████╗ ██████╗ ███╗   ███╗██████╗ ██╗   ██╗████████╗███████╗██████╗
  // ██╔════╝██╔═══██╗████╗ ████║██╔══██╗██║   ██║╚══██╔══╝██╔════╝██╔══██╗
  // ██║     ██║   ██║██╔████╔██║██████╔╝██║   ██║   ██║   █████╗  ██║  ██║
  // ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║   ██║   ██║   ██╔══╝  ██║  ██║
  // ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ╚██████╔╝   ██║   ███████╗██████╔╝
  //  ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═════╝    ╚═╝   ╚══════╝╚═════╝

  const computed = new (class {
    configChanged = useMemo(() => {
      return JSON.stringify(store.config) !== JSON.stringify(store.savedConfig);
    }, [store]);

    navPages = useMemo(() => {
      return store.config.pages.filter((page) => page.onNav);
    }, [store.config.pages]);

    hiddenPages = useMemo(() => {
      return store.config.pages.filter((page) => !page.onNav);
    }, [store.config.pages]);

    subdomainChanged = useMemo(() => {
      return store.config.subdomain !== store.savedConfig.subdomain;
    }, [store.config.subdomain, store.savedConfig.subdomain]);

    selectedPage = useMemo(() => {
      return store.config.pages.find((page) => page.uuid === store.selectedPageId);
    }, [store.selectedPageId, store.config.pages]);
  })();

  // ███████╗███████╗███████╗███████╗ ██████╗████████╗███████╗
  // ██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝╚══██╔══╝██╔════╝
  // █████╗  █████╗  █████╗  █████╗  ██║        ██║   ███████╗
  // ██╔══╝  ██╔══╝  ██╔══╝  ██╔══╝  ██║        ██║   ╚════██║
  // ███████╗██║     ██║     ███████╗╚██████╗   ██║   ███████║
  // ╚══════╝╚═╝     ╚═╝     ╚══════╝ ╚═════╝   ╚═╝   ╚══════╝

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

  //  █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
  // ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
  // ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
  // ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
  // ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
  // ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  function setConfigVal(key: string, val: any) {
    patchStore({ config: { ...store.config, [key]: val } });
  }

  function saveConfig() {
    patchStore({ savedConfig: store.config });
  }

  //  +-+-+-+-+-+
  //  |P|A|G|E|S|
  //  +-+-+-+-+-+

  const pages = new (class {
    patch(uuid: string, patch: Partial<Page>) {
      setConfigVal(
        'pages',
        store.config.pages.map((page) => {
          if (page.uuid === uuid) {
            return { ...page, ...patch };
          } else {
            return page;
          }
        }),
      );
    }

    add() {
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

    move(uuid: string, target: { uuid?: string; nav: boolean }) {
      console.log(uuid, target);
      let page = store.config.pages.find((page) => page.uuid === uuid)!;
      page = { ...page, onNav: target.nav };
      let pages = store.config.pages.filter((page) => page.uuid !== uuid);

      if (target.uuid) {
        const targetIndex = pages.findIndex((page) => page.uuid === target.uuid);
        pages.splice(targetIndex + 1, 0, page);
      } else {
        pages.unshift(page);
      }
      setConfigVal('pages', pages);
    }

    remove(uuid: string) {
      setConfigVal(
        'pages',
        store.config.pages.filter((page) => page.uuid !== uuid),
      );
    }
  })();

  //  +-+-+
  //  |U|I|
  //  +-+-+

  function startEditing() {
    patchStore({ editing: true });
  }

  function finishEditing() {
    patchStore({ editing: false });
  }

  function toggleSettingsMenu() {
    patchStore({ settingsMenuOpen: !store.settingsMenuOpen });
  }

  function navigateTo(path: string) {
    const page = store.config.pages.find((page) => page.path === path);
    console.log('Navigating to:', path, page);
    if (page) {
      patchStore({ selectedPageId: page.uuid });
    } else {
      console.error('Page not found', path);
      // TODO: Add some sort of 404 handling
    }
  }

  return {
    store,
    ...computed,
    actions: {
      setConfigVal,
      saveConfig,
      pages,
      startEditing,
      finishEditing,
      toggleSettingsMenu,
      navigateTo,
    },
  };
}

//  ██████╗ ██████╗ ███╗   ██╗████████╗███████╗██╗  ██╗████████╗
// ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝
// ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗   ╚███╔╝    ██║
// ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝   ██╔██╗    ██║
// ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██╔╝ ██╗   ██║
//  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝

const StoreContext = createContext<ReturnType<typeof useStoreBase>>(undefined!);

export const StoreContextWrapper = ({ init, children }: { init: StoreInit; children: any }) => {
  const store = useStoreBase(init);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export default function useStore() {
  return useContext(StoreContext);
}
