export type BuildFile = {
  name: string;
  content: string;
};

export type BuildContext = {
  files: BuildFile[];
  vars: Record<string, any>;
  errors: string[];
};
