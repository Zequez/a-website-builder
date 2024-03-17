export type Site = {
  id: string | null;
  localId: string;
  name: string;
  localName: string;
  files: LocalFiles;
};

export type LocalFile = {
  id: string | null;
  name: string;
  content: string;
  // unsavedContent: string;
  // remote?: {
  //   name: string;
  //   content: string;
  // };
};

export type LocalFiles = { [key: string]: LocalFile };
