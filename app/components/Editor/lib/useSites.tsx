import { useState, useEffect } from 'preact/hooks';
import { Site, EditorFiles } from '../types';
import { useSitesStorage } from './SitesLocalStorage';

export default function useSites() {
  const storage = useSitesStorage('__SITES__');

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
  };
}
