import { SiteWithFiles as DbSite, FileB64 as DbFile } from '@db';

export type LocalSite = {
  id: string;
  name: string;
  localName: string;

  localId?: string;
  files: LocalFiles;
  generatedFiles?: LocalFiles;
  updatedAt: Date;
};

export type LocalFile = {
  id: string;
  name: string;
  content: string;
  // unsavedContent: string;
  // remote?: {
  //   name: string;
  //   content: string;
  // };
  updatedAt: Date;
};

export type LocalFiles = { [key: string]: LocalFile };
