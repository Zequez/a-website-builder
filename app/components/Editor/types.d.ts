import { SiteWithFiles as DbSite, FileB64 as DbFile } from '@db';

export type LocalSite = {
  id: string;
  name: string;
  localName: string;

  localId?: string;
  files: LocalFiles;
  generatedFiles?: LocalFiles;
  updatedAt: Date;
  deleted: boolean;
};

export type _LocalSite = {
  id: string;
  name: string;
  localName: string;

  updatedAt: Date;
  deleted: boolean;
};

export type LocalFile = {
  id: string;
  name: string;
  content: string;
  siteId: string;
  // unsavedContent: string;
  // remote?: {
  //   name: string;
  //   content: string;
  // };
  updatedAt: Date;
  deleted: boolean;
};

export type LocalFiles = { [key: string]: LocalFile };
