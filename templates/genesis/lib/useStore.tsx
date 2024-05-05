import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import * as pipes from '../lib/pipes';
import configDefault from '../config-default';
import createValidator, { ValidationError } from '../config-validator';

type Store = {
  editing: boolean;
  settingsMenuOpen: boolean;
  selectedPageId: null | string;
  siteId: null | string;
  accessKey: string | null;
  siteNeedsToBeCreated: boolean;

  // CONFIG STUFF
  config: Config;
  savedConfig: Config;
  configNeedsToLoadFromServer: boolean;
  invalidConfig: null | Record<string, any>;
  remoteSetConfigErrors: ValidationError[];
  configIsSaving: boolean;

  //
  subdomainAvailabilityStatus: 'unknown' | 'available' | 'taken';
};

type StoreInit = {
  config: Config | null;
  siteId: string | null;
  editing: boolean;
  selectedPageId: string | null;
};

export function useStoreBase(init: StoreInit) {
  const firstPage = init.config ? init.config.pages[0] : null;
  const initialConfig = init.config ?? configDefault;

  const INITIAL_STATE: Store = {
    editing: init.editing,

    selectedPageId: firstPage?.uuid || null,
    siteId: init.siteId,
    accessKey: null,
    //
    siteNeedsToBeCreated: !init.siteId,
    configNeedsToLoadFromServer: !init.config,

    //
    configIsSaving: false,
    savedConfig: { ...initialConfig },
    config: { ...initialConfig },
    invalidConfig: null,
    remoteSetConfigErrors: [],

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

    documentTitle = useMemo(() => {
      const rest = this.selectedPage ? this.selectedPage.title : 'Page not found';
      return `${rest} ← ${store.config.title}`;
    }, [this.selectedPage, store.config.title]);
  })();

  // ███████╗███████╗███████╗███████╗ ██████╗████████╗███████╗
  // ██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝╚══██╔══╝██╔════╝
  // █████╗  █████╗  █████╗  █████╗  ██║        ██║   ███████╗
  // ██╔══╝  ██╔══╝  ██╔══╝  ██╔══╝  ██║        ██║   ╚════██║
  // ███████╗██║     ██║     ███████╗╚██████╗   ██║   ███████║
  // ╚══════╝╚═╝     ╚═╝     ╚══════╝ ╚═════╝   ╚═╝   ╚══════╝

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    window.document.title = computed.documentTitle;
  }, [computed.documentTitle]);

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

  async function initialize() {
    if (store.configNeedsToLoadFromServer) {
      if (store.siteId) {
        const { config } = await pipes.tsite({ siteId: store.siteId, props: ['config'] });
        const validator = createValidator();
        if (validator(config)) {
          const validConfig = config as Config;
          patchStore({
            config: validConfig,
            savedConfig: { ...validConfig },
            configNeedsToLoadFromServer: false,
          });
        } else {
          console.error('Invalid configuration', config);
          patchStore({
            invalidConfig: config,
          });
        }
      } else {
        console.error('No config or site ID was provided');
      }
    }
  }

  async function retryFixConfig(config: Config) {
    if (store.siteId) {
      const { errors } = await pipes.tsiteSetConfig({ siteId: store.siteId, config });
      if (errors.length === 0) {
        patchStore({
          config,
          savedConfig: { ...config },
          configNeedsToLoadFromServer: false,
          remoteSetConfigErrors: [],
        });
      } else {
        patchStore({
          remoteSetConfigErrors: errors,
        });
      }
    }
  }

  function setConfigVal(key: string, val: any) {
    patchStore({ config: { ...store.config, [key]: val } });
  }

  async function saveConfig() {
    patchStore({ configIsSaving: true });
    const { errors } = await pipes.tsiteSetConfig({ siteId: store.siteId!, config: store.config });
    if (errors.length === 0) {
      patchStore({ savedConfig: store.config, configIsSaving: false, remoteSetConfigErrors: [] });
    } else {
      patchStore({ remoteSetConfigErrors: errors, configIsSaving: false });
    }
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

  function navigateTo(path: string) {
    const page = store.config.pages.find((page) => page.path === path);
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
      setConfig: retryFixConfig,
      pages,
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
