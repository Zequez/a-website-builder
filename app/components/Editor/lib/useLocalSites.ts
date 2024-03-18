import { useState, useEffect } from 'preact/hooks';
import { LocalFile, LocalFiles, LocalSite } from '../types';
import { randomAlphaNumericString, uuid } from '@shared/utils';

export class SitesLocalStorage {
  LS_PREFIX: string;
  _byId: Record<string, LocalSite> = {};
  onChange: () => void = () => {};

  constructor(prefix: string) {
    this.LS_PREFIX = prefix;
    this.loadAllSites();
  }

  asNewObject(): SitesLocalStorage {
    const cloned = Object.create(Object.getPrototypeOf(this));
    cloned._byId = this._byId;
    cloned.onChange = this.onChange;
    cloned.LS_PREFIX = this.LS_PREFIX;
    // console.log(this, cloned);
    return cloned as SitesLocalStorage;
  }

  update(id: string, update: Partial<LocalSite>) {
    const site = this.byId(id);
    this.set({ ...site, ...update, updatedAt: new Date() });
  }

  delete_(id: string) {
    this.deleteItem(id);
    delete this._byId[id];
    this.onChange();
  }

  get all(): LocalSite[] {
    return Object.values(this._byId);
  }

  byId(id: string): LocalSite {
    const found = this._byId[id];
    if (!found) {
      throw `No site with id ${id} in local storage`;
    }
    return found;
  }

  set(site: LocalSite) {
    this.setItem(site.id, JSON.stringify(site));
    this._byId[site.id] = site;
    this.onChange();
  }

  // addRemote(site: LocalSite) {
  //   this.set(site);
  // }

  // makeRemote(localId: string, id: string) {
  //   console.warn('makeRemote Deprecated function');
  //   // const site = this.byId(localId);
  //   // const updatedSite = { ...site, localId: id, id };
  //   // this.setItem(updatedSite.localId, JSON.stringify(updatedSite));
  //   // this._byId[updatedSite.localId] = updatedSite;
  //   // this.deleteItem(localId);
  //   // delete this._byId[localId];
  //   // this.onChange();
  // }

  findByLocalName(localName: string) {
    return this.all.find((site) => site.localName === localName) || null;
  }

  // ███████╗██╗██╗     ███████╗███████╗
  // ██╔════╝██║██║     ██╔════╝██╔════╝
  // █████╗  ██║██║     █████╗  ███████╗
  // ██╔══╝  ██║██║     ██╔══╝  ╚════██║
  // ██║     ██║███████╗███████╗███████║
  // ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝

  renameFile(id: string, oldFileName: string, newFileName: string) {
    const site = this.byId(id);
    const file = site.files[oldFileName];
    if (!file) throw `No file name ${oldFileName} in site ${site.localName}`;
    const newFiles = { ...site.files, [newFileName]: { ...file, name: newFileName } };
    delete newFiles[oldFileName];
    this.set({ ...site, files: newFiles });
  }

  createFile(id: string, name: string) {
    return this.writeFile(id, name, '');
  }

  writeFile(id: string, name: string, content: string) {
    const site = this.byId(id);
    const existingFile = site.files[name];
    const file = existingFile
      ? { ...existingFile, content, updatedAt: new Date() }
      : { id: uuid(), name, content, updatedAt: new Date() };
    const newFiles = {
      ...site.files,
      [name]: { ...file, content },
    };
    this.set({ ...site, files: newFiles });
    return file;
  }

  deleteFile(id: string, name: string) {
    const site = this.byId(id);
    const newFiles = { ...site.files };
    delete newFiles[name];
    this.set({ ...site, files: newFiles });
  }

  allFiles(): LocalFiles {
    return this.all.reduce<{ [key: string]: LocalFile }>((acc, site) => {
      for (let file in site.files) {
        acc[site.files[file].id] = site.files[file];
      }
      return acc;
    }, {});
  }

  // ██████╗ ██████╗ ██╗██╗   ██╗ █████╗ ████████╗███████╗
  // ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗╚══██╔══╝██╔════╝
  // ██████╔╝██████╔╝██║██║   ██║███████║   ██║   █████╗
  // ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║   ██║   ██╔══╝
  // ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║   ██║   ███████╗
  // ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝   ╚══════╝

  private loadAllSites() {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.LS_PREFIX))
      .forEach((key) => this.loadSite(key.slice(this.LS_PREFIX.length)));
  }

  private loadSite(id: string) {
    const siteEncoded = this.getItem(id);
    if (!siteEncoded) {
      throw `No site with local id ${id} in local storage`;
    }
    const site = JSON.parse(siteEncoded) as LocalSite;
    site.updatedAt = new Date(site.updatedAt);

    if (site.id !== id) {
      this.delete_(id);
      throw `Invalid site on localstorage; removing`;
    }

    this._byId[id] = site;
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

export default function useLocalSites(prefix: string) {
  const [storage, setStorage] = useState(() => new SitesLocalStorage(prefix));

  useEffect(() => {
    // @ts-ignore
    window.localSites = storage;
    storage.onChange = () => {
      setStorage(storage.asNewObject());
    };
  }, []);

  return storage;
}
