import { useState, useEffect, useCallback } from 'preact/hooks';
import { LocalSite, LocalFiles, LocalFile } from '../types';
import { keyBy, randomAlphaNumericString, uuid } from '@shared/utils';
import { SiteWithFiles } from '@db';
import { FileB64 } from '@server/db/driver';
import { MemberAuth } from '@app/components/Auth';

import useLocalSites from './useLocalSites';
import useRemoteSites from './useRemoteSites';
import { resolveSyncStatus } from './sync';

function toArr<T>(x: T | T[]) {
  return Array.isArray(x) ? x : [x];
}

export default function useSites(memberAuth: MemberAuth | null) {
  const storage = useLocalSites('__SITES__');
  const remote = useRemoteSites(memberAuth);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string[]>([]);

  const [selectedLocalId, setSelected] = useState<string | null>(null);

  // useEffect(() => {
  //   if (remote.sites) {
  //     loadFromRemoteSites(remote.sites);
  //   }
  // }, [remote.sites]);

  const localFiles = storage.allFiles();
  const remoteFiles = remote.allFiles;

  const sitesSyncStatus = resolveSyncStatus(storage.all, remote.sites);
  const filesSyncStatus = resolveSyncStatus(
    Object.values(storage.allFiles()),
    Object.values(remote.allFiles),
  );

  const sync = useCallback(async () => {
    console.log('Sync attempt!');
    if (remote.loaded && !isSyncing && !syncError.length) {
      setIsSyncing(true);
      console.log('Attempting to sync');
      for (let siteId in sitesSyncStatus) {
        const status = sitesSyncStatus[siteId];
        const localSite = storage._byId[siteId];
        const remoteSite = remote._byId[siteId];
        if (status === 'local-only') {
          // Create on remote
          const { error } = await remote.publishSite(localSite);
          if (error) setSyncError(toArr(error));
        } else if (status == 'local-latest') {
          // Update remote
          const { error } = await remote.putSite(localSite);
          if (error) setSyncError(toArr(error));
        } else if (status === 'remote-only') {
          // Create on local
          storage.set(remoteSite);
        } else if (status === 'remote-latest') {
          // Update on local
          storage.set(remoteSite);
        } else if (status === 'synced') {
          // Do nothing
        }
      }
      setIsSyncing(false);
    } else {
      console.log('Already syncing!');
    }
  }, [isSyncing, sitesSyncStatus]);

  // ███████╗██╗████████╗███████╗███████╗
  // ██╔════╝██║╚══██╔══╝██╔════╝██╔════╝
  // ███████╗██║   ██║   █████╗  ███████╗
  // ╚════██║██║   ██║   ██╔══╝  ╚════██║
  // ███████║██║   ██║   ███████╗███████║
  // ╚══════╝╚═╝   ╚═╝   ╚══════╝╚══════╝

  function setName(id: string, newName: string) {
    storage.update(id, { name: newName });
  }

  function setLocalName(id: string, newLocalName: string): Promise<boolean> {
    if (!newLocalName) return Promise.resolve(false);
    const existingSite = storage.findByLocalName(newLocalName);
    return new Promise((resolve) => {
      // TODO: Should also check the server
      if (existingSite) {
        resolve(existingSite.id === id);
      } else {
        storage.update(id, { localName: newLocalName });
        resolve(true);
      }
    });
  }

  function addSite(template: LocalFiles = {}) {
    storage.set({
      id: uuid(),
      localName: randomAlphaNumericString(),
      name: 'New Site',
      files: template,
      generatedFiles: {},
      updatedAt: new Date(),
    });
  }

  function deleteSite(localId: string) {
    storage.delete_(localId);
  }

  // ███████╗██╗██╗     ███████╗███████╗
  // ██╔════╝██║██║     ██╔════╝██╔════╝
  // █████╗  ██║██║     █████╗  ███████╗
  // ██╔══╝  ██║██║     ██╔══╝  ╚════██║
  // ██║     ██║███████╗███████╗███████║
  // ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝

  function writeFile(localId: string, fileName: string, content: string) {
    storage.writeFile(localId, fileName, content);
    // (async () => {
    //   const file = storage.byId(localId).files[fileName];
    //   if (file.id) {
    //     const { error } = await remote.putFile({
    //       id: file.id,
    //       name: file.name,
    //       content: file.content,
    //     });
    //     if (error) {
    //       console.error('Error writing remote file', error);
    //     }
    //   }
    // })();
  }

  function createFile(localId: string, name: string, content: string) {
    storage.writeFile(localId, name, content);
    // (async () => {
    //   const site = storage.byId(localId);
    //   if (site.id) {
    //     await remote.postFile(site.id, { name, content });
    //   }
    // })();
  }

  function renameFile(localId: string, fileName: string, newFileName: string) {
    storage.renameFile(localId, fileName, newFileName);
    // (async () => {
    //   const site = storage.byId(localId);
    //   const file = site.files[newFileName];
    //   if (file.id) {
    //     await remote.putFile({
    //       id: file.id,
    //       name: newFileName,
    //       content: file.content,
    //     });
    //   }
    // })();
  }

  function deleteFile(localId: string, fileName: string) {
    const site = storage.byId(localId);
    const file = site.files[fileName];
    storage.deleteFile(localId, fileName);
    // (async () => {
    //   if (site.id && file.id) {
    //     await remote.deleteFile(file.id);
    //   }
    // })();
  }

  function applyTemplate(id: string, files: LocalFiles) {
    const site = storage.byId(id);
    storage.update(id, { files: { ...site.files, ...files } });
  }

  function setGeneratedFiles(id: string, files: LocalFiles) {
    storage.update(id, { generatedFiles: files });
  }

  return {
    byLocalId: (localId: string) => storage.byId(localId),
    sites: storage.all,
    remoteSites: remote.sites,
    setName,
    setLocalName,
    addSite,
    deleteSite,
    selectedLocalId,
    setSelected,
    selectedSite: selectedLocalId ? storage.byId(selectedLocalId) : null,

    localFiles,
    remoteFiles,
    sitesSyncStatus,
    filesSyncStatus,
    isSyncing,
    sync,
    syncError,

    createFile,
    renameFile,
    writeFile,
    deleteFile,
    applyTemplate,
    setGeneratedFiles,
  };
}
