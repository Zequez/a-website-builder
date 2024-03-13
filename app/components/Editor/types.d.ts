export type Site = {
  id: string | null;
  localId: string;
  name: string;
  localName: string;
  files: EditorFiles;
};

export type EditorFile = {
  id: string | null;
  name: string;
  content: string;
  // unsavedContent: string;
  // remote?: {
  //   name: string;
  //   content: string;
  // };
};

export type EditorFiles = { [key: string]: EditorFile };
