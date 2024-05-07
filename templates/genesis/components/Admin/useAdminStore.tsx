import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import * as pipes from '../../lib/pipes';
import * as storage from '../../lib/storage';
import { createContext } from 'preact';
import { Tsites } from '@db/schema';
import configDefault from '../../config-default';
import { randomAlphaNumericString } from '@shared/utils';
import { ValidationError } from '../../config-validator';

export type PartialSite = Pick<Tsites, 'id' | 'name' | 'subdomain' | 'domain' | 'deleted_at'>;

type AdminStore = {
  accessKeyToken: string | null;
  attemptAccessLoading: boolean;
  sites: PartialSite[] | null;
  createSiteInProgress: boolean;
  createSiteErrors: ValidationError[];
  inProgress: {
    deleteSite: boolean;
    restoreSite: boolean;
    deleteSiteForGood: boolean;
    createSite: boolean;
  };
};

type StoreInit = {};

export function useAdminStoreBase(init: StoreInit) {
  const [store, setStoreBase] = useState<AdminStore>({
    accessKeyToken: storage.getMemberToken(),
    attemptAccessLoading: false,
    sites: null,
    createSiteInProgress: false,
    createSiteErrors: [],
    inProgress: {
      deleteSite: false,
      restoreSite: false,
      deleteSiteForGood: false,
      createSite: false,
    },
  });

  function setStore(store: AdminStore | ((currentStore: AdminStore) => AdminStore)) {
    setStoreBase(store);
  }

  function patchStore(
    patch: Partial<AdminStore> | ((currentStore: AdminStore) => Partial<AdminStore>),
  ) {
    setStore((currentStore) => ({
      ...currentStore,
      ...(typeof patch === 'function' ? patch(currentStore) : patch),
    }));
  }

  function patchSite(siteId: string, patch: Partial<PartialSite>) {
    patchStore((st) => ({
      sites: st.sites!.map((site) => {
        if (site.id === siteId) {
          return { ...site, ...patch };
        } else {
          return site;
        }
      }),
    }));
  }

  function inProgressStart(key: keyof AdminStore['inProgress']) {
    patchStore((st) => ({ inProgress: { ...st.inProgress, [key]: true } }));
  }

  function inProgressEnd(key: keyof AdminStore['inProgress']) {
    patchStore((st) => ({ inProgress: { ...st.inProgress, [key]: false } }));
  }

  //  ██████╗ ██████╗ ███╗   ███╗██████╗ ██╗   ██╗████████╗███████╗██████╗
  // ██╔════╝██╔═══██╗████╗ ████║██╔══██╗██║   ██║╚══██╔══╝██╔════╝██╔══██╗
  // ██║     ██║   ██║██╔████╔██║██████╔╝██║   ██║   ██║   █████╗  ██║  ██║
  // ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║   ██║   ██║   ██╔══╝  ██║  ██║
  // ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ╚██████╔╝   ██║   ███████╗██████╔╝
  //  ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═════╝    ╚═╝   ╚══════╝╚═════╝

  const computed = new (class {
    activeSites = useMemo(() => {
      console.log('Recalculating active sites');
      return store.sites?.filter((site) => !site.deleted_at) || null;
    }, [store.sites]);

    deletedSites = useMemo(() => {
      return store.sites?.filter((site) => !!site.deleted_at) || null;
    }, [store.sites]);
  })();

  useEffect(() => {
    console.log('SITES changed');
  }, [store.sites]);

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
    if (store.accessKeyToken) {
      actions.loadAllSites();
    }
  }, [store.accessKeyToken]);

  //  █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
  // ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
  // ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
  // ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
  // ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
  // ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  async function initialize() {}

  const actions = new (class {
    async loadAllSites() {
      if (store.accessKeyToken) {
        const sites = (await pipes.adminTsites({
          props: ['id', 'name', 'subdomain', 'domain', 'deleted_at'],
          token: store.accessKeyToken,
        })) as PartialSite[];
        patchStore({ sites });
      }
    }

    async attemptAccess(email: string, password: string) {
      patchStore({ attemptAccessLoading: true });
      const token = await pipes.tokenFromMemberCredentials({ email, password });
      if (token) {
        storage.setMemberToken(token);
        patchStore({ accessKeyToken: token, attemptAccessLoading: false });
        return true;
      } else {
        patchStore({ attemptAccessLoading: false });
        return false;
      }
    }

    async setAccessKey(siteId: string, accessKey: string) {
      return await pipes.setAccessKey({ siteId, accessKey, token: store.accessKeyToken! });
    }

    async saveSite(site: PartialSite) {
      const currentSite = store.sites!.find((s) => s.id === site.id)!;
      const sitePatch = {
        ...(site.name !== currentSite.name && { name: site.name }),
        ...(site.subdomain !== currentSite.subdomain && { subdomain: site.subdomain }),
        ...(site.domain !== currentSite.domain && { domain: site.domain }),
      };
      if (Object.keys(sitePatch).length > 0) {
        const response = await pipes.adminSaveSite({
          siteId: site.id!,
          site: sitePatch,
          token: store.accessKeyToken!,
        });
        if (!response.errors.length) {
          patchSite(site.id!, sitePatch);
        }
        return response;
      } else {
        return { errors: [] };
      }
    }

    async createSite() {
      patchStore({ createSiteErrors: [], createSiteInProgress: true });
      const config = { ...configDefault };
      config.subdomain = randomAlphaNumericString();
      const { errors, site } = await pipes.adminCreateSite({
        token: store.accessKeyToken!,
        site: { name: 'Nuevo sitio', config },
      });
      patchStore({
        createSiteErrors: errors,
        sites: site ? [...store.sites!, site] : store.sites,
        createSiteInProgress: false,
      });
    }

    async deleteSite(siteId: string) {
      inProgressStart('deleteSite');
      await pipes.adminDeleteSite({ siteId, token: store.accessKeyToken! });
      patchSite(siteId, { deleted_at: new Date() });
      inProgressEnd('deleteSite');
    }

    async restoreSite(siteId: string) {
      inProgressStart('restoreSite');
      await pipes.adminRestoreSite({ siteId, token: store.accessKeyToken! });
      patchSite(siteId, { deleted_at: null });
      inProgressEnd('restoreSite');
    }

    async deleteSiteForGood(siteId: string) {
      inProgressStart('deleteSiteForGood');
      await pipes.adminDeleteSiteForGood({ siteId, token: store.accessKeyToken! });
      patchStore({ sites: store.sites!.filter((s) => s.id !== siteId) });
      inProgressEnd('deleteSiteForGood');
    }
  })();

  return {
    store,
    actions,
    computed,
  };
}

//  ██████╗ ██████╗ ███╗   ██╗████████╗███████╗██╗  ██╗████████╗
// ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝
// ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗   ╚███╔╝    ██║
// ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝   ██╔██╗    ██║
// ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██╔╝ ██╗   ██║
//  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝

const AdminStoreContext = createContext<ReturnType<typeof useAdminStoreBase>>(undefined!);

export const AdminStoreContextWrapper = ({
  init,
  children,
}: {
  init: StoreInit;
  children: any;
}) => {
  const store = useAdminStoreBase(init);
  return <AdminStoreContext.Provider value={store}>{children}</AdminStoreContext.Provider>;
};

export default function useAdminStore() {
  return useContext(AdminStoreContext);
}
