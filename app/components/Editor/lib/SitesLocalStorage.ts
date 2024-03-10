import { useState, useEffect } from 'preact/hooks';
import { Site } from '../types';
import { randomAlphaNumericString } from './utils';

export default class SitesLocalStorage {
  LS_PREFIX: string;
  _byLocalId: Record<string, Site> = {};
  onChange: () => void = () => {};

  constructor(prefix: string) {
    this.LS_PREFIX = prefix;
    this.loadAllSites();
  }

  clone(): SitesLocalStorage {
    const cloned = Object.create(Object.getPrototypeOf(this));
    cloned._byLocalId = { ...this._byLocalId };
    cloned.onChange = this.onChange;
    cloned.LS_PREFIX = this.LS_PREFIX;
    // console.log(this, cloned);
    return cloned as SitesLocalStorage;
  }

  update(localId: string, update: Partial<Site>) {
    const site = this.byLocalId(localId);
    this.set({ ...site, ...update });
  }

  delete_(localId: string) {
    this.deleteItem(localId);
    delete this._byLocalId[localId];
    this.onChange();
  }

  renameFile(localId: string, oldFileName: string, newFileName: string) {
    const site = this.byLocalId(localId);
    const file = site.files[oldFileName];
    if (!file) throw `No file name ${oldFileName} in site ${site.localName}`;
    const newFiles = { ...site.files, [newFileName]: { ...file, name: newFileName } };
    delete newFiles[oldFileName];
    this.set({ ...site, files: newFiles });
  }

  writeFile(localId: string, fileName: string, content: string) {
    const site = this.byLocalId(localId);
    const file = site.files[fileName];
    if (!file) throw `No file name ${fileName} in site ${site.localName}`;
    const newFiles = {
      ...site.files,
      [fileName]: { ...file, content },
    };
    this.set({ ...site, files: newFiles });
  }

  get all(): Site[] {
    return Object.values(this._byLocalId);
  }

  byLocalId(localId: string): Site {
    const found = this._byLocalId[localId];
    if (!found) {
      throw `No site with local id ${localId} in local storage`;
    }
    return found;
  }

  addLocal(site: Omit<Site, 'localId' | 'localName'>) {
    let newLocalId = '';
    do {
      newLocalId = randomAlphaNumericString();
    } while (this._byLocalId[newLocalId]);

    this.set({ ...site, localId: newLocalId, localName: newLocalId });
  }

  findByLocalName(localName: string) {
    return this.all.find((site) => site.localName === localName) || null;
  }

  private loadAllSites() {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.LS_PREFIX))
      .forEach((key) => this.loadSite(key.slice(this.LS_PREFIX.length)));
  }

  private loadSite(localId: string) {
    const siteEncoded = this.getItem(localId);
    if (!siteEncoded) {
      throw `No site with local id ${localId} in local storage`;
    }
    const site = JSON.parse(siteEncoded) as Site;

    if (site.localId !== localId) {
      this.delete_(localId);
      throw `Invalid site on localstorage; removing`;
    }

    this._byLocalId[localId] = site;
  }

  private set(site: Site) {
    this.setItem(site.localId, JSON.stringify(site));
    this._byLocalId[site.localId] = site;
    this.onChange();
  }

  private getItem(key: string) {
    return localStorage.getItem(`${this.LS_PREFIX}${key}`);
  }

  private setItem(key: string, val: string) {
    localStorage.setItem(`${this.LS_PREFIX}${key}`, val);
  }

  private deleteItem(key: string) {
    localStorage.removeItem(`${this.LS_PREFIX}${key}`);
  }
}

export function useSitesStorage(prefix: string) {
  const [storage, setStorage] = useState(() => new SitesLocalStorage(prefix));

  useEffect(() => {
    storage.onChange = () => {
      setStorage((latestStorage) => latestStorage.clone());
    };
  }, []);

  return storage;
}
