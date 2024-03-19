import { useState, useEffect, useCallback, useMemo } from 'preact/hooks';
import { LocalFile, LocalSite } from '../types';
import { randomAlphaNumericString, uuid } from '@shared/utils';
import { MemberAuth } from '@app/components/Auth';
import * as api from '@app/lib/api';

import { resolveSyncStatus } from './sync';
import useLocalResource from './useLocalResource';
import useRemoteResources from './useRemoteResources';
import {
  RouteGetFiles,
  RouteGetFilesQuery,
  RouteGetSites,
  RouteGetSitesQuery,
} from '@server/routes/api/types';
import { useLocalStorageState } from '@app/lib/utils';

function toArr<T>(x: T | T[]) {
  return Array.isArray(x) ? x : [x];
}

export default function useSites(memberAuth: MemberAuth | null) {
  const [syncEnabled, setSyncEnabled] = useLocalStorageState('sync_enabled', false);

  const _LSites = useLocalResource<LocalSite>({ localStoragePrefix: '__SITES__' });
  const _LFiles = useLocalResource<LocalFile>({ localStoragePrefix: '__FILES__' });

  const fetchParams = useMemo(
    () => (memberAuth ? { member_id: memberAuth.member.id } : null),
    [memberAuth],
  );

  const _RSites = useRemoteResources<RouteGetSitesQuery, RouteGetSites, LocalSite>({
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

  const _RFiles = useRemoteResources<RouteGetFilesQuery, RouteGetFiles, LocalFile>({
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
          data: btoa(file.content),
        },
        token,
      ),
    putEndpoint: (file: LocalFile, token: any) =>
      api.putFile(
        {
          id: file.id,
          name: file.name,
          data: btoa(file.content),
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

  // ███████╗██╗████████╗███████╗███████╗    ███████╗██╗   ██╗███╗   ██╗ ██████╗
  // ██╔════╝██║╚══██╔══╝██╔════╝██╔════╝    ██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
  // ███████╗██║   ██║   █████╗  ███████╗    ███████╗ ╚████╔╝ ██╔██╗ ██║██║
  // ╚════██║██║   ██║   ██╔══╝  ╚════██║    ╚════██║  ╚██╔╝  ██║╚██╗██║██║
  // ███████║██║   ██║   ███████╗███████║    ███████║   ██║   ██║ ╚████║╚██████╗
  // ╚══════╝╚═╝   ╚═╝   ╚══════╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝

  const sitesSyncStatus = useMemo(
    () => resolveSyncStatus(_LSites.list, _RSites.list),
    [_LSites.list, _RSites.list],
  );
  const [isSyncingSites, setIsSyncingSites] = useState(false);
  const [sitesSyncingError, setSitesSyncingError] = useState<string[]>([]);
  const syncSites = useCallback(async () => {
    if (_RSites._byId && !isSyncingSites && !sitesSyncingError.length) {
      setIsSyncingSites(true);
      console.log('Attempting to sync sites');
      for (let siteId in sitesSyncStatus) {
        const status = sitesSyncStatus[siteId];
        if (status === 'synced') continue;
        const localSite = _LSites._byId[siteId];
        const remoteSite = _RSites._byId[siteId];
        if (status === 'local-only') {
          // Create on remote
          if (!localSite.deleted) {
            const { error } = await _RSites.post(localSite);
            if (error) setSitesSyncingError(toArr(error));
          } else {
            _LSites.remove(localSite.id);
          }
        } else if (status === 'local-latest') {
          if (!localSite.deleted) {
            const { error } = await _RSites.put(localSite);
            if (error) setSitesSyncingError(toArr(error));
          } else {
            const { error } = await _RSites.delete(localSite);
            if (error) setSitesSyncingError(toArr(error));
            else {
              _LSites.remove(localSite.id);
            }
          }
        } else if (status === 'remote-only' || status === 'remote-latest') {
          _LSites.set(remoteSite);
        }
      }
      setIsSyncingSites(false);
    }
  }, [sitesSyncStatus, isSyncingSites, _RSites._byId, _LSites._byId]);

  // ███████╗██╗██╗     ███████╗███████╗    ███████╗██╗   ██╗███╗   ██╗ ██████╗
  // ██╔════╝██║██║     ██╔════╝██╔════╝    ██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
  // █████╗  ██║██║     █████╗  ███████╗    ███████╗ ╚████╔╝ ██╔██╗ ██║██║
  // ██╔══╝  ██║██║     ██╔══╝  ╚════██║    ╚════██║  ╚██╔╝  ██║╚██╗██║██║
  // ██║     ██║███████╗███████╗███████║    ███████║   ██║   ██║ ╚████║╚██████╗
  // ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝

  const filesSyncStatus = useMemo(
    () => resolveSyncStatus(_LFiles.list, _RFiles.list),
    [_LFiles.list, _RFiles.list],
  );
  const [isSyncingFiles, setIsSyncingFiles] = useState(false);
  const [filesSyncingError, setFilesSyncingError] = useState<string[]>([]);
  const syncFiles = useCallback(async () => {
    if (_RFiles._byId && !isSyncingFiles && !filesSyncingError.length) {
      setIsSyncingFiles(true);
      console.log('Attempting to sync files');
      for (let fileId in filesSyncStatus) {
        const status = filesSyncStatus[fileId];
        if (status === 'synced') continue;
        const localFile = _LFiles._byId[fileId];
        const remoteFile = _RFiles._byId[fileId];
        if (status === 'local-only') {
          if (!localFile.deleted) {
            const { error } = await _RFiles.post(localFile);
            if (error) setFilesSyncingError(toArr(error));
          } else {
            _LFiles.remove(localFile.id);
          }
        } else if (status === 'local-latest') {
          if (!localFile.deleted) {
            const { error } = await _RFiles.put(localFile);
            if (error) setFilesSyncingError(toArr(error));
          } else {
            const { error } = await _RFiles.delete(localFile);
            if (error) setFilesSyncingError(toArr(error));
            else {
              _LFiles.remove(localFile.id);
            }
          }
        } else if (status === 'remote-only' || status === 'remote-latest') {
          _LFiles.set(remoteFile);
        }
      }
      setIsSyncingFiles(false);
    }
  }, [filesSyncStatus, isSyncingFiles, _RFiles._byId, _LFiles._byId]);

  // ███████╗██╗████████╗███████╗███████╗
  // ██╔════╝██║╚══██╔══╝██╔════╝██╔════╝
  // ███████╗██║   ██║   █████╗  ███████╗
  // ╚════██║██║   ██║   ██╔══╝  ╚════██║
  // ███████║██║   ██║   ███████╗███████║
  // ╚══════╝╚═╝   ╚═╝   ╚══════╝╚══════╝

  function setSiteName(id: string, newName: string) {
    _LSites.update(id, { name: newName });
  }

  function setSiteLocalName(id: string, newLocalName: string): Promise<boolean> {
    if (!newLocalName) return Promise.resolve(false);
    const existingSite = _LSites.list.find((s) => s.localName === newLocalName);
    return new Promise((resolve) => {
      // TODO: Should also check the server
      if (existingSite) {
        resolve(existingSite.id === id);
      } else {
        _LSites.update(id, { localName: newLocalName });
        resolve(true);
      }
    });
  }

  function addSite() {
    _LSites.set({
      id: uuid(),
      localName: randomAlphaNumericString(),
      name: 'New Site',
      updatedAt: new Date(),
      deleted: false,
    });
  }

  function deleteSite(id: string) {
    _LSites.update(id, { deleted: true });
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
    _LFiles.update(file.id, file);
  }

  function createFile(siteId: string, file: { name: string; content: string }) {
    return _LFiles.set({
      id: uuid(),
      name: file.name,
      siteId,
      content: file.content,
      updatedAt: new Date(),
      deleted: false,
    });
  }

  function renameFile(file: { id: string; name: string }) {
    _LFiles.update(file.id, { name: file.name });
  }

  function deleteFile(id: string) {
    _LFiles.update(id, { deleted: true });
    if (id === selectedFileId) {
      setSelectedFileId(null);
    }
  }

  function applyTemplate(id: string, files: { name: string; content: string }[]) {
    const site = _LSites.byId[id];
    if (!site) return;
    files.forEach((f) => {
      createFile(id, f);
    });
  }

  function siteFiles(siteId: string) {
    return _LFiles.list.filter((f) => f.siteId === siteId);
  }
  const selectedSiteFiles = useMemo(() => {
    if (selectedSiteId) {
      return siteFiles(selectedSiteId);
    } else {
      return null;
    }
  }, [selectedSiteId, _LFiles.list]);

  useEffect(() => {
    if (syncEnabled) {
      syncSites();
    }
  }, [syncEnabled, sitesSyncStatus]);

  useEffect(() => {
    if (syncEnabled) {
      syncFiles();
    }
  }, [syncEnabled, filesSyncStatus]);

  return {
    // Sites

    LSites: _RSites,
    RSites: _RSites,

    selectSite: (id: string) => {
      setSelectedSiteId(id);
      const firstFile = _LFiles.list.find((f) => f.siteId === id);
      setSelectedFileId(firstFile ? firstFile.id : null);
    },
    selectedSiteId,
    selectedSite: selectedSiteId ? _LSites.byId[selectedSiteId] : null,
    selectedSiteFiles,
    siteFiles,

    sitesById: _LSites.byId,
    sitesList: _LSites.list,
    isSyncingSites,
    sitesSyncingError,
    sitesSyncStatus,

    setSiteName,
    setSiteLocalName,
    addSite,
    deleteSite,

    // Files
    LFiles: _RFiles,
    RFiles: _RFiles,

    selectedFileId,
    selectFile: setSelectedFileId,
    selectedFile: selectedFileId ? _LFiles.byId[selectedFileId] : null,

    filesById: _LFiles.byId,
    filesList: _LFiles.list,
    isSyncingFiles,
    filesSyncingError,
    filesSyncStatus,

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
