export type Site = {
  id: string | null;
  localId: string;
  name: string;
  localName: string;
  files: EditorFiles;
};

export type EditorFile = {
  name: string;
  content: string;
};

export type EditorFiles = { [key: string]: EditorFile };
