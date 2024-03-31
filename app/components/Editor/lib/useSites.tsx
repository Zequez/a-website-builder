import { useState, useEffect, useCallback, useMemo } from 'preact/hooks';
import { LocalFile, LocalSite } from '../types';
import { randomAlphaNumericString, uuid, encodeB64 } from '@shared/utils';
import { MemberAuth } from '@app/components/Auth';
import * as api from '@app/lib/api';

import useLocalResources from './useLocalResources';
import useRemoteResources from './useRemoteResources';
import {
  RouteGetFiles,
  RouteGetFilesQuery,
  RouteGetSites,
  RouteGetSitesQuery,
} from '@server/routes/api/types';
import { useLocalStorageState } from '@app/lib/utils';

export default function useSites(memberAuth: MemberAuth | null) {
  const [syncEnabled, setSyncEnabled] = useLocalStorageState('sync_enabled', false);

  useEffect(() => {
    console.log('SETTING THING!');
    localStorage.setItem(
      'storage_member_id',
      JSON.stringify(memberAuth ? memberAuth.member.id : null),
    );
  }, [memberAuth]);

  const LSites = useLocalResources<LocalSite>({ localStoragePrefix: '__SITES__' });
  const LFiles = useLocalResources<LocalFile>({ localStoragePrefix: '__FILES__' });

  const fetchParams = useMemo(
    () => (memberAuth ? { member_id: memberAuth.member.id } : null),
    [memberAuth],
  );

  const RSites = useRemoteResources<RouteGetSitesQuery, RouteGetSites, LocalSite>({
    auth: memberAuth,
    fetchEndpoint: api.getSites,
    fetchParams,
    parseRemoteData: (sites: RouteGetSites) =>
      sites.map((site) => ({
        id: site.id,
        name: site.name,
        localName: site.local_name,
        updatedAt: new Date(site.updated_at),
        deleted: false,
      })),
    postEndpoint: api.postSite,
    putEndpoint: api.putSite,
    deleteEndpoint: api.deleteSite,
  });

  const RFiles = useRemoteResources<RouteGetFilesQuery, RouteGetFiles, LocalFile>({
    auth: memberAuth,
    fetchEndpoint: api.getFiles,
    fetchParams,
    parseRemoteData: (files: RouteGetFiles) =>
      files.map((f) => ({
        id: f.id,
        name: f.name,
        content: atob(f.data),
        updatedAt: new Date(f.updated_at),
        siteId: f.site_id,
        deleted: false,
      })),
    postEndpoint: (file: LocalFile, token: any) =>
      api.postFile(
        {
          id: file.id,
          site_id: file.siteId,
          name: file.name,
          data: encodeB64(file.content),
        },
        token,
      ),
    putEndpoint: (file: LocalFile, token: any) =>
      api.putFile(
        {
          id: file.id,
          name: file.name,
          data: encodeB64(file.content),
        },
        token,
      ),
    deleteEndpoint: (file: LocalFile, token: any) =>
      api.deleteFile(
        {
          id: file.id,
        },
        token,
      ),
  });

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // ███████╗██╗   ██╗███╗   ██╗ ██████╗
  // ██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
  // ███████╗ ╚████╔╝ ██╔██╗ ██║██║
  // ╚════██║  ╚██╔╝  ██║╚██╗██║██║
  // ███████║   ██║   ██║ ╚████║╚██████╗
  // ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingErrors, setSyncingErrors] = useState<{
    [key: string]: [string, LocalSite | LocalFile, unknown];
  }>({});
  const syncSitesAndFiles = useCallback(async () => {
    const RS = RSites._byId;
    const LS = LSites._byId;
    const RF = RFiles._byId;
    const LF = LFiles._byId;

    // No syncing if remote files haven't loaded yet
    if (!RS || !RF) return;

    // No syncing while another syncing is in progress
    if (isSyncing) return;
    console.log('SYNC STARTING');
    setIsSyncing(true);

    function pairUp<T>(local: { [key: string]: T }, remote: { [key: string]: T }) {
      const paired: { [key: string]: [T | null, T | null] } = {};
      for (let id in local) {
        const item = local[id];
        paired[id] = [item, null];
      }
      for (let id in remote) {
        const item = remote[id];
        paired[id] = paired[id] ? [paired[id][0], item] : [null, item];
      }
      return paired;
    }

    const SS = pairUp(LS, RS);
    const FF = pairUp(LF, RF);

    const A = {
      PUT_REMOTE_SITE: (site: LocalSite) => RSites.put(site),
      POST_REMOTE_SITE: (site: LocalSite) => RSites.post(site),
      DELETE_REMOTE_SITE: (site: LocalSite) => RSites.delete(site),
      DELETE_LOCAL_SITE: async (site: LocalSite) => LSites.remove(site.id),
      SET_LOCAL_SITE: async (site: LocalSite) => LSites.set(site),

      PUT_REMOTE_FILE: (file: LocalFile) => RFiles.put(file),
      POST_REMOTE_FILE: (file: LocalFile) => RFiles.post(file),
      DELETE_REMOTE_FILE: (file: LocalFile) => RFiles.delete(file),
      MARK_REMOTE_FILE_AS_DELETED: (file: LocalFile) => RFiles.markAsDeleted(file),
      DELETE_LOCAL_FILE: async (file: LocalFile) => LFiles.remove(file.id),
      SET_LOCAL_FILE: async (file: LocalFile) => LFiles.set(file),
    };

    const queue: [keyof typeof A, LocalFile | LocalSite][] = [];
    const Q = (action: keyof typeof A, arg: LocalSite | LocalFile) => queue.push([action, arg]);

    function getTime(site: LocalSite | LocalFile) {
      return Math.floor(site.updatedAt.getTime() / 1000);
    }

    // Sync sites
    for (let id in SS) {
      const [localSite, remoteSite] = SS[id];
      if (localSite && localSite.deleted && !remoteSite) {
        Q('DELETE_LOCAL_SITE', localSite);
        for (let [lf, rf] of Object.values(FF)) {
          if (lf?.siteId === id) {
            Q('DELETE_LOCAL_FILE', lf);
          }
        }
      } else if (localSite && localSite.deleted && remoteSite) {
        Q('DELETE_REMOTE_SITE', remoteSite);
        for (let [lf, rf] of Object.values(FF)) {
          if (lf?.siteId === id) {
            Q('DELETE_LOCAL_FILE', lf);
          }
          if (rf?.siteId === id) {
            Q('MARK_REMOTE_FILE_AS_DELETED', rf);
          }
        }
        Q('DELETE_LOCAL_SITE', localSite);
      } else if (localSite && remoteSite) {
        const localUpdatedAt = getTime(localSite);
        const remoteUpdatedAt = getTime(remoteSite);
        if (localUpdatedAt < remoteUpdatedAt) {
          Q('SET_LOCAL_SITE', remoteSite);
        } else if (localUpdatedAt > remoteUpdatedAt) {
          Q('PUT_REMOTE_SITE', localSite);
        } else {
          // Doing nothing
        }
      } else if (localSite && !remoteSite) {
        Q('POST_REMOTE_SITE', localSite);
      } else if (!localSite && remoteSite) {
        Q('SET_LOCAL_SITE', remoteSite);
      }
    }

    for (let id in FF) {
      const [localFile, remoteFile] = FF[id];
      if (localFile && localFile.deleted && !remoteFile) {
        Q('DELETE_LOCAL_FILE', localFile);
      } else if (localFile && localFile.deleted && remoteFile) {
        Q('DELETE_REMOTE_FILE', remoteFile);
      } else if (localFile && remoteFile) {
        const localUpdatedAt = getTime(localFile);
        const remoteUpdatedAt = getTime(remoteFile);
        if (localUpdatedAt < remoteUpdatedAt) {
          Q('SET_LOCAL_FILE', remoteFile);
        } else if (localUpdatedAt > remoteUpdatedAt) {
          Q('PUT_REMOTE_FILE', localFile);
        } else {
          // Doing nothing
        }
      } else if (localFile && !remoteFile) {
        Q('POST_REMOTE_FILE', localFile);
      } else if (!localFile && remoteFile) {
        Q('SET_LOCAL_FILE', remoteFile);
      }
    }

    console.log('SYNC QUEUE', queue);
    const errors: { [key: string]: [string, LocalSite | LocalFile, unknown] } = {};
    for (let [action, arg] of queue) {
      try {
        const response = (await A[action](arg as any)) as any;
        if (response && response.error) {
          errors[arg.id] = [action, arg, response.error];
        }
      } catch (error) {
        errors[arg.id] = [action, arg, error];
      }
    }
    if (Object.keys(errors).length > 0) {
      console.error('SYNC ERRORS', errors);
      setSyncingErrors(errors);
    } else if (Object.keys(syncingErrors).length > 0) {
      setSyncingErrors({});
    }

    setIsSyncing(false);
    console.log('SYNC FINISHED');
  }, [isSyncing, LSites._byId, RSites._byId, LFiles._byId, RFiles._byId]);

  useEffect(() => {
    if (!isSyncing && syncEnabled && Object.keys(syncingErrors).length === 0) {
      syncTimeout = setTimeout(() => {
        syncSitesAndFiles();
      }, 3000);
    }
    return () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, [
    syncEnabled,
    syncingErrors,
    isSyncing,
    LSites._byId,
    RSites._byId,
    LFiles._byId,
    RFiles._byId,
  ]);

  // ███████╗██╗████████╗███████╗███████╗
  // ██╔════╝██║╚══██╔══╝██╔════╝██╔════╝
  // ███████╗██║   ██║   █████╗  ███████╗
  // ╚════██║██║   ██║   ██╔══╝  ╚════██║
  // ███████║██║   ██║   ███████╗███████║
  // ╚══════╝╚═╝   ╚═╝   ╚══════╝╚══════╝

  function setSiteName(id: string, newName: string) {
    LSites.update(id, { name: newName });
  }

  function setSiteLocalName(id: string, newLocalName: string): Promise<boolean> {
    if (!newLocalName) return Promise.resolve(false);
    const existingSite = LSites.list.find((s) => s.localName === newLocalName);
    return new Promise((resolve) => {
      // TODO: Should also check the server
      if (existingSite) {
        resolve(existingSite.id === id);
      } else {
        LSites.update(id, { localName: newLocalName });
        resolve(true);
      }
    });
  }

  function addSite() {
    const newSite = LSites.set({
      id: uuid(),
      localName: randomAlphaNumericString(),
      name: 'New site',
      updatedAt: new Date(),
      deleted: false,
    });
    const newPage = LFiles.set({
      id: uuid(),
      name: 'pages/index.jsx',
      siteId: newSite.id,
      content: '',
      updatedAt: new Date(),
      deleted: false,
    });
    setSelectedSiteId(newSite.id);
    setSelectedFileId(newPage.id);
  }

  function deleteSite(id: string) {
    LSites.update(id, { deleted: true });
    if (id === selectedSiteId) {
      setSelectedSiteId(null);
      setSelectedFileId(null);
    }
  }

  // ███████╗██╗██╗     ███████╗███████╗
  // ██╔════╝██║██║     ██╔════╝██╔════╝
  // █████╗  ██║██║     █████╗  ███████╗
  // ██╔══╝  ██║██║     ██╔══╝  ╚════██║
  // ██║     ██║███████╗███████╗███████║
  // ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝

  function writeFile(file: { id: string; name: string; content: string }) {
    LFiles.update(file.id, file);
  }

  function createFile(siteId: string, file: { name: string; content: string }) {
    const newFile = {
      id: uuid(),
      name: file.name,
      siteId,
      content: file.content,
      updatedAt: new Date(),
      deleted: false,
    };
    return checkNameAvailable(newFile) ? LFiles.set(newFile) : null;
  }

  function checkNameAvailable(file: { id: string; name: string; siteId: string }) {
    return !LFiles.list.find(
      (f) => f.siteId === file.siteId && f.name === file.name && f.id !== file.id,
    );
  }

  function renameFile(file: { id: string; name: string; siteId: string }) {
    if (!checkNameAvailable(file)) {
      return;
    }
    LFiles.update(file.id, { name: file.name });
  }

  function deleteFile(id: string) {
    if (!LFiles.byId[id].deleted) {
      LFiles.update(id, { deleted: true });
      if (id === selectedFileId) {
        setSelectedFileId(null);
      }
    }
  }

  function applyTemplate(id: string, files: { name: string; content: string }[]) {
    const site = LSites.byId[id];
    if (!site) return;
    files.forEach((f) => {
      createFile(id, f);
    });
  }

  function siteFiles(siteId: string) {
    return LFiles.list.filter((f) => f.siteId === siteId && !f.deleted);
  }
  const selectedSiteFiles = useMemo(() => {
    if (selectedSiteId) {
      return siteFiles(selectedSiteId);
    } else {
      return null;
    }
  }, [selectedSiteId, LFiles.list]);

  // Remove orphaned files belonging to non-existant sites
  useEffect(() => {
    const allLocalSitesIds = LSites.list.map((s) => s.id);
    const orphanFiles = LFiles.list.filter((f) => !allLocalSitesIds.includes(f.siteId));
    orphanFiles.forEach((file) => LFiles.remove(file.id));
  }, [LSites.list, LFiles.list]);

  const sitesListSortedByLastUpdatedFile = useMemo(() => {
    return LSites.list
      .filter((s) => !s.deleted)
      .sort((a, b) => {
        const aLastUpdatedFile: { updatedAt: Date } =
          LFiles.listByLastUpdate.find((f) => f.siteId === a.id) || a;
        const bLastUpdatedFile: { updatedAt: Date } =
          LFiles.listByLastUpdate.find((f) => f.siteId === b.id) || b;
        return bLastUpdatedFile.updatedAt.getTime() - aLastUpdatedFile.updatedAt.getTime();
      });
  }, [LSites.list, LFiles.listByLastUpdate]);

  return {
    // Sites

    LSites,
    RSites,

    selectSite: (id: string) => {
      setSelectedSiteId(id);
      const firstFile = LFiles.list.find((f) => f.siteId === id);
      setSelectedFileId(firstFile ? firstFile.id : null);
    },
    selectedSiteId,
    selectedSite: selectedSiteId ? LSites.byId[selectedSiteId] : null,
    selectedSiteFiles,
    siteFiles,

    sitesById: LSites.byId,
    sitesList: LSites.list,
    sitesListSortedByLastUpdatedFile,
    isSyncing,
    syncingErrors,

    setSiteName,
    setSiteLocalName,
    addSite,
    deleteSite,

    // Files
    LFiles,
    RFiles,

    selectedFileId,
    selectFile: setSelectedFileId,
    selectedFile: selectedFileId ? LFiles.byId[selectedFileId] : null,

    filesById: LFiles.byId,
    filesList: LFiles.list,

    createFile,
    renameFile,
    writeFile,
    deleteFile,
    applyTemplate,

    // Other
    syncEnabled,
    setSyncEnabled,
  };
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
