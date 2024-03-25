export type BuildFile = {
  name: string;
  content: string;
};

export type BuildError = {
  e?: any;
  message: string;
  file?: BuildFile;
};

export type BuildContext = {
  files: BuildFile[];
  vars: Record<string, any>;
  errors: BuildError[];
};
