import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import * as pipes from './pipes';
import configDefault from '../config-default';
import createValidator, { ValidationError, validateConfig } from '../config-validator';
import * as storage from './storage';
import prerender from '../prerender';
import { slugify, wait } from '@shared/utils';
import * as urlHelpers from './url-helpers';
import { usePatchableStore } from './usePatchableStore';
import migrateConfig, { latestConfigVersion } from '../config-migrator';

type Store = {
  editing: boolean;
  previewing: boolean;
  settingsMenuOpen: boolean;
  selectedPageId: null | string;
  siteId: string;
  attemptAccessLoading: boolean;
  accessToken: string | null;

  deploySiteInProgress: boolean;

  // CONFIG STUFF
  config: Config;
  savedConfig: Config;
  publishedConfig: Config;
  configNeedsToLoadFromServer: boolean;
  loadedFromLocalConfig: boolean;
  invalidConfig: null | Record<string, any>;
  remoteSetConfigErrors: ValidationError[];
  configIsSaving: boolean;

  //
  subdomainAvailabilityStatus: 'unknown' | 'available' | 'taken';
};

type StoreInit = {
  config: Config | null;
  siteId: string;
  initialPath: string;
  editing: boolean;
};

export function useStoreBase(init: StoreInit) {
  const { store, patchStore } = usePatchableStore<Store>(() => {
    const initialConfig = init.config ?? configDefault;

    const localConfig = storage.getLocalConfigSave(init.siteId);
    const shouldUseLocalConfig = !!(
      init.editing &&
      localConfig &&
      localConfig.iteration > initialConfig.iteration
    );

    const resolvedConfig = shouldUseLocalConfig ? localConfig : initialConfig;

    return {
      editing: init.editing,
      previewing: false,

      selectedPageId:
        initialConfig.pages.find((page) => page.path === init.initialPath)?.uuid || null,
      siteId: init.siteId,
      attemptAccessLoading: false,
      accessToken: storage.getMemberToken() || storage.getAccessKeyToken(init.siteId) || null,
      //
      configNeedsToLoadFromServer: !init.config,
      loadedFromLocalConfig: shouldUseLocalConfig,

      //
      configIsSaving: false,
      savedConfig: { ...resolvedConfig },
      config: { ...resolvedConfig },
      publishedConfig: { ...resolvedConfig },
      invalidConfig: null,
      remoteSetConfigErrors: [],

      //
      deploySiteInProgress: false,

      //
      subdomainAvailabilityStatus: 'available',

      //
      settingsMenuOpen: false,
    };
  });

  function patchConfig(patch: Partial<Config> | ((config: Config) => Partial<Config>)) {
    return patchStore(({ config }) => {
      const newConfig = {
        ...config,
        ...(typeof patch === 'function' ? patch(config) : patch),
        iteration: Date.now(),
      };

      storage.setLocalConfigSave(init.siteId, newConfig);

      return {
        config: newConfig,
      };
    });
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

    publishedConfigIsDifferent = useMemo(() => {
      return JSON.stringify(store.config) !== JSON.stringify(store.publishedConfig);
    }, [store.savedConfig, store.publishedConfig]);

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

    showPreScreen = useMemo(() => {
      return store.configNeedsToLoadFromServer;
    }, [store.configNeedsToLoadFromServer]);

    pathname = useMemo(() => {
      return this.selectedPage ? this.selectedPage.path : window.location.pathname;
    }, [this.selectedPage]);

    editorUrl = useMemo(() => {
      return urlHelpers.editorUrl(store.siteId!, this.pathname);
    }, [store.siteId, this.pathname]);
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
    if (!store.editing) {
      window.document.title = computed.documentTitle;
    }
  }, [computed.documentTitle, store.editing]);

  useEffect(() => {
    // Let's disable this for now, the server checks on saving
    // if (store.siteId) {
    //   if (store.config.subdomain !== store.savedConfig.subdomain) {
    //     patchStore({ subdomainAvailabilityStatus: 'unknown' });
    //     pipes
    //       .checkSubdomainAvailability({ subdomain: store.config.subdomain, siteId: store.siteId })
    //       .then((status) => {
    //         patchStore({ subdomainAvailabilityStatus: status ? 'available' : 'taken' });
    //       });
    //   }
    // }
  }, [store.config.subdomain, store.savedConfig.subdomain, store.siteId]);

  // Load Configuration
  useEffect(() => {
    (async () => {
      if (store.accessToken && store.configNeedsToLoadFromServer) {
        let { config: serverConfig } = (await pipes.tsite({
          siteId: store.siteId,
          props: ['config'],
        }))!;
        let localConfig = store.config;

        function validateMigrateAndValidate(config: Config) {
          const errors = validateConfig(config);
          if (errors.length) {
            const migrated = migrateConfig(config);
            const newErrors = validateConfig(migrated);
            return { config: migrated, errors: newErrors };
          } else {
            return { config, errors };
          }
        }

        const { config: migratedServerConfig, errors } = validateMigrateAndValidate(serverConfig);

        if (errors.length) {
          console.error('Invalid configuration', migratedServerConfig);
          patchStore({
            invalidConfig: migratedServerConfig,
          });
        }

        const preferLocal =
          store.loadedFromLocalConfig && store.config.iteration >= migratedServerConfig.iteration;

        if (preferLocal) {
          const { config: migratedLocalConfig, errors } = validateMigrateAndValidate(localConfig);
          if (!errors.length) {
            localConfig = migratedLocalConfig;
          } else {
            console.error('Local config couldnt be migrated properly', migratedLocalConfig, errors);
          }
        } else {
          localConfig = migratedServerConfig;
        }

        const initialPage = localConfig.pages.find((page) => page.path === init.initialPath);

        patchStore({
          config: localConfig,
          savedConfig: { ...migratedServerConfig },
          publishedConfig: { ...migratedServerConfig },
          configNeedsToLoadFromServer: false,
          selectedPageId: initialPage?.uuid || null,
        });
      }
    })();
  }, [store.accessToken, store.siteId, store.configNeedsToLoadFromServer]);

  //  █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
  // ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
  // ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
  // ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
  // ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
  // ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  async function initialize() {
    console.log('Store initialized with', init, store);
  }

  function setConfigVal(key: string, val: any) {
    patchConfig((config) => ({ ...config, [key]: val }));
  }

  function setThemeVal(key: keyof Config['theme'], val: any) {
    setConfigVal('theme', { ...store.config.theme, [key]: val });
  }

  async function saveConfig() {
    patchStore({ configIsSaving: true });
    const { errors } = await pipes.tsiteSetConfig({
      siteId: store.siteId!,
      config: store.config,
      token: store.accessToken!,
    });
    if (errors.length === 0) {
      patchStore({ savedConfig: store.config, configIsSaving: false, remoteSetConfigErrors: [] });
    } else {
      patchStore({ remoteSetConfigErrors: errors, configIsSaving: false });
    }
  }

  async function deploySite() {
    let result = false;
    if (store.siteId) {
      patchStore({ deploySiteInProgress: true });
      const prerenderedPages = await prerender(store.siteId, store.config);
      if (prerenderedPages) {
        result = await pipes.deploySite({
          siteId: store.siteId,
          deployConfig: store.config,
          prerenderedPages,
          token: store.accessToken!,
        });
      }
      patchStore({ deploySiteInProgress: false, publishedConfig: store.config });
    }
    return result;
  }

  async function attemptAccess(accessKey: string, saveKey: boolean) {
    patchStore({ attemptAccessLoading: true });
    const token = await pipes.tokenFromAccessKey({
      siteId: store.siteId!,
      plainAccessKey: accessKey,
    });
    if (token) {
      if (saveKey) {
        storage.setAccessKeyToken(store.siteId!, token);
      }
      patchStore({ accessToken: token, attemptAccessLoading: false });
      return true;
    } else {
      patchStore({ attemptAccessLoading: false });
      return false;
    }
  }

  //  +-+-+-+-+-+
  //  |P|A|G|E|S|
  //  +-+-+-+-+-+

  function setPagesPaths(pages: PageConfig[]): PageConfig[] {
    let navIndex = -1;
    let reservedPaths: string[] = ['/app'];
    return pages.map((page, i) => {
      if (page.onNav) navIndex += 1;
      let newPath = navIndex === 0 ? '/' : '/' + (page.title ? slugify(page.title) : page.uuid);
      if (reservedPaths.includes(newPath)) {
        newPath = newPath + '_';
      }
      reservedPaths.push(newPath);
      if (newPath !== page.path) {
        return { ...page, path: newPath };
      } else {
        return page;
      }
    });
  }

  function setPages(
    pages: PageConfig[] | ((pages: PageConfig[]) => PageConfig[]),
    regenerateUrls: boolean = true,
  ) {
    patchConfig((config) => {
      const resolvedPages = typeof pages === 'function' ? pages(config.pages) : pages;
      const finalPages = regenerateUrls ? setPagesPaths(resolvedPages) : resolvedPages;
      return { pages: finalPages };
    });
  }

  const pages = new (class {
    patch(uuid: string, patch: Partial<PageConfig>) {
      setPages(
        (pages) =>
          pages.map((page) => {
            if (page.uuid === uuid) {
              return { ...page, ...patch };
            } else {
              return page;
            }
          }),
        patch.title ? true : false,
      );
    }

    add() {
      const uuid = crypto.randomUUID();
      const newPage: PageConfig = {
        version: 1,
        uuid,
        path: '/' + uuid,
        title: '',
        icon: '',
        onNav: false,
        elements: [],
      };
      setPages(store.config.pages.concat(newPage), false);
    }

    move(uuid: string, target: { uuid?: string; nav: boolean }) {
      let page = store.config.pages.find((page) => page.uuid === uuid)!;
      page = { ...page, onNav: target.nav };
      let pages = store.config.pages.filter((page) => page.uuid !== uuid);

      if (target.uuid) {
        const targetIndex = pages.findIndex((page) => page.uuid === target.uuid);
        pages.splice(targetIndex + 1, 0, page);
      } else {
        pages.unshift(page);
      }
      setPages(pages, true);
    }

    remove(uuid: string) {
      setPages(
        store.config.pages.filter((page) => page.uuid !== uuid),
        true,
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
      if (import.meta.env.DEV || store.editing) {
        const { siteId } = urlHelpers.hash.getData();
        const newPath =
          window.location.pathname + '#!' + urlHelpers.hash.generate({ siteId, path });
        history.pushState({}, '', newPath);
      } else {
        history.pushState({}, '', path);
      }
    } else {
      patchStore({ selectedPageId: null });
    }
  }

  function toggleEditing() {
    patchStore({ editing: !store.editing });
  }

  function togglePreviewing() {
    patchStore({ previewing: !store.previewing });
  }

  return {
    store,
    ...computed,
    actions: {
      setConfigVal,
      saveConfig,
      setThemeVal,
      deploySite,
      attemptAccess,
      pages,
      navigateTo,
      toggleEditing,
      togglePreviewing,
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

export default function useEditorStore() {
  return useContext(StoreContext);
}
