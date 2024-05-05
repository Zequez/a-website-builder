import { useContext, useEffect, useState } from 'preact/hooks';
import * as pipes from '../../lib/pipes';
import * as storage from '../../lib/storage';
import { createContext } from 'preact';
import { TSite } from '@db';

type AdminStore = {
  accessKeyToken: string | null;
  attemptAccessLoading: boolean;
  sites: Partial<TSite>[] | null;
};

type StoreInit = {};

export function useAdminStoreBase(init: StoreInit) {
  const [store, setStoreBase] = useState<AdminStore>({
    accessKeyToken: storage.getMemberToken(),
    attemptAccessLoading: false,
    sites: null,
  });

  function setStore(store: AdminStore) {
    console.log('Admin setStore', store);
    setStoreBase(store);
  }

  function patchStore(patch: Partial<AdminStore>) {
    setStore({ ...store, ...patch });
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
      const sites = await pipes.tsites({
        props: ['id', 'name', 'subdomain', 'domain'],
        token: store.accessKeyToken,
      });
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

  return {
    store,
    actions: {
      attemptAccess,
      setAccessKey,
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
