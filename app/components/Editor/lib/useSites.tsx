import { useState, useEffect } from 'preact/hooks';
import { Site, EditorFiles, EditorFile } from '../types';
import { keyBy } from '@shared/utils';
import { SiteWithFiles } from '@db';
import { FileB64 } from '@server/db/driver';
import { MemberAuth } from '@app/components/Auth';

import useLocalSites from './useLocalSites';
import useRemoteSites from './useRemoteSites';

export default function useSites(memberAuth: MemberAuth | null) {
  const storage = useLocalSites('__SITES__');
  const remote = useRemoteSites(memberAuth);

  const [selectedLocalId, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (remote.sites) {
      loadFromRemoteSites(remote.sites);
    }
  }, [remote.sites]);

  function setName(localId: string, newName: string) {
    storage.update(localId, { name: newName });
  }

  function setLocalName(localId: string, newLocalName: string): Promise<boolean> {
    if (!newLocalName) return Promise.resolve(false);
    const existingSite = storage.findByLocalName(newLocalName);
    return new Promise((resolve) => {
      if (existingSite) {
        resolve(existingSite.localId === localId);
      } else {
        storage.update(localId, { localName: newLocalName });
        resolve(true);
      }
    });
  }

  function writeFile(localId: string, fileName: string, content: string) {
    storage.writeFile(localId, fileName, content);
    (async () => {
      const file = storage.byLocalId(localId).files[fileName];
      const { error } = await remote.writeFile(file);
      if (error) {
        console.error('Error writing remote file', error);
      }
    })();
  }

  function renameFile(localId: string, fileName: string, newFileName: string) {
    storage.renameFile(localId, fileName, newFileName);
  }

  function addSite(template: EditorFiles = {}) {
    storage.addLocal({
      id: null,
      name: 'New Site',
      files: template,
    });
  }

  function deleteSite(localId: string) {
    storage.delete_(localId);
  }

  function applyTemplate(localId: string, files: EditorFiles) {
    const site = storage.byLocalId(localId);
    storage.update(localId, { files: { ...site.files, ...files } });
  }

  function loadFromRemoteSites(remoteSites: SiteWithFiles[]) {
    for (const site of remoteSites) {
      storage.addRemote({
        id: site.id.toString(),
        localId: site.id.toString(),
        name: site.name,
        localName: site.local_name,
        files: keyBy(site.files.map(remoteFileToLocalFile), 'name'),
      });
    }
  }

  function publishSite(localId: string) {
    const site = storage.byLocalId(localId);
    if (site.id === null) {
      (async () => {
        const { data, error } = await remote.publishSite(site);

        if (data) {
          setSelected(data.id.toString());
          storage.makeRemote(localId, data.id.toString());
        } else {
          console.error('Error publishing site', error);
        }
      })();
    } else {
      // Site is already published, update it instead
    }
  }

  return {
    byLocalId: (localId: string) => storage.byLocalId(localId),
    sites: storage.all,
    setName,
    setLocalName,
    writeFile,
    renameFile,
    addSite,
    deleteSite,
    applyTemplate,
    publishSite,
    selectedLocalId,
    setSelected,
    selectedSite: selectedLocalId ? storage.byLocalId(selectedLocalId) : null,
  };
}

function remoteFileToLocalFile(fileB64: FileB64): EditorFile {
  return {
    id: fileB64.id,
    name: fileB64.name,
    content: atob(fileB64.data),
  };
}
