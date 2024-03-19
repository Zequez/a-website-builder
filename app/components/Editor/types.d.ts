import { SiteWithFiles as DbSite, FileB64 as DbFile } from '@db';

export type LocalSite = {
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

  updatedAt: Date;
  deleted: boolean;
};

export type LocalFiles = { [key: string]: LocalFile };
