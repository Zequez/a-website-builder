export type Site = {
  storage: 'local' | 'remote';
  files: { [key: string]: EditorFile };
};

export type EditorFile = {
  name: string;
  content: string;
};

export type EditorFiles = { [key: string]: EditorFile };
