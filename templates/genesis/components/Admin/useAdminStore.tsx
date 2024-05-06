import { useContext, useEffect, useState } from 'preact/hooks';
import * as pipes from '../../lib/pipes';
import * as storage from '../../lib/storage';
import { createContext } from 'preact';
import { Tsites } from '@db/schema';
import configDefault from '../../config-default';
import { randomAlphaNumericString } from '@shared/utils';
import { ValidationError } from '../../config-validator';

export type PartialSite = Pick<Tsites, 'id' | 'name' | 'subdomain' | 'domain'>;

type AdminStore = {
  accessKeyToken: string | null;
  attemptAccessLoading: boolean;
  sites: PartialSite[] | null;
  createSiteInProgress: boolean;
  createSiteErrors: ValidationError[];
};

type StoreInit = {};

export function useAdminStoreBase(init: StoreInit) {
  const [store, setStoreBase] = useState<AdminStore>({
    accessKeyToken: storage.getMemberToken(),
    attemptAccessLoading: false,
    sites: null,
    createSiteInProgress: false,
    createSiteErrors: [],
  });

  function setStore(store: AdminStore) {
    console.log('Admin setStore', store);
    setStoreBase(store);
  }

  function patchStore(patch: Partial<AdminStore>) {
    setStore({ ...store, ...patch });
  }

  function patchSite(siteId: string, patch: Partial<PartialSite>) {
    setStore({
      ...store,
      sites: store.sites!.map((site) => {
        if (site.id === siteId) {
          return { ...site, ...patch };
        } else {
          return site;
        }
      }),
    });
  }

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
      loadAllSites();
    }
  }, [store.accessKeyToken]);

  //  █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
  // ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
  // ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
  // ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
  // ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
  // ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  async function initialize() {}

  async function loadAllSites() {
    if (store.accessKeyToken) {
      const sites = (await pipes.tsites({
        props: ['id', 'name', 'subdomain', 'domain'],
        token: store.accessKeyToken,
      })) as PartialSite[];
      patchStore({ sites });
    }
  }

  async function attemptAccess(email: string, password: string) {
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

  async function setAccessKey(siteId: string, accessKey: string) {
    return await pipes.setAccessKey({ siteId, accessKey, token: store.accessKeyToken! });
  }

  async function saveSite(site: PartialSite) {
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

  async function createSite() {
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

  return {
    store,
    actions: {
      attemptAccess,
      setAccessKey,
      saveSite,
      createSite,
    },
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
