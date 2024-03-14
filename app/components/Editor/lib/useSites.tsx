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

  // ███████╗██╗████████╗███████╗███████╗
  // ██╔════╝██║╚══██╔══╝██╔════╝██╔════╝
  // ███████╗██║   ██║   █████╗  ███████╗
  // ╚════██║██║   ██║   ██╔══╝  ╚════██║
  // ███████║██║   ██║   ███████╗███████║
  // ╚══════╝╚═╝   ╚═╝   ╚══════╝╚══════╝

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
        const { data: createdSite, error } = await remote.publishSite(site);

        if (createdSite) {
          setSelected(createdSite.id.toString());
          storage.makeRemote(localId, createdSite.id.toString());
          for (let fileName in site.files) {
            const file = site.files[fileName];
            await remote.postFile(createdSite.id, file);
          }
        } else {
          console.error('Error publishing site', error);
        }
      })();
    } else {
      // Site is already published, update it instead
    }
  }

  // ███████╗██╗██╗     ███████╗███████╗
  // ██╔════╝██║██║     ██╔════╝██╔════╝
  // █████╗  ██║██║     █████╗  ███████╗
  // ██╔══╝  ██║██║     ██╔══╝  ╚════██║
  // ██║     ██║███████╗███████╗███████║
  // ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝

  function writeFile(localId: string, fileName: string, content: string) {
    storage.writeFile(localId, fileName, content);
    (async () => {
      const file = storage.byLocalId(localId).files[fileName];
      if (file.id) {
        const { error } = await remote.putFile({
          id: file.id,
          name: file.name,
          content: file.content,
        });
        if (error) {
          console.error('Error writing remote file', error);
        }
      }
    })();
  }

  function createFile(localId: string, name: string, content: string) {
    storage.writeFile(localId, name, content);
    (async () => {
      const site = storage.byLocalId(localId);
      if (site.id) {
        await remote.postFile(parseInt(site.id), { name, content });
      }
    })();
  }

  function renameFile(localId: string, fileName: string, newFileName: string) {
    storage.renameFile(localId, fileName, newFileName);
    (async () => {
      const site = storage.byLocalId(localId);
      const file = site.files[newFileName];
      if (file.id) {
        await remote.putFile({
          id: file.id,
          name: newFileName,
          content: file.content,
        });
      }
    })();
  }

  function applyTemplate(localId: string, files: EditorFiles) {
    const site = storage.byLocalId(localId);
    storage.update(localId, { files: { ...site.files, ...files } });
  }

  return {
    byLocalId: (localId: string) => storage.byLocalId(localId),
    sites: storage.all,
    setName,
    setLocalName,
    addSite,
    deleteSite,
    publishSite,
    selectedLocalId,
    setSelected,
    selectedSite: selectedLocalId ? storage.byLocalId(selectedLocalId) : null,

    createFile,
    renameFile,
    writeFile,
    applyTemplate,
  };
}

function remoteFileToLocalFile(fileB64: FileB64): EditorFile {
  return {
    id: fileB64.id,
    name: fileB64.name,
    content: atob(fileB64.data),
  };
}
