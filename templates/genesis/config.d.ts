type Config = {
  title: string;
  foo: boolean;
  pages: Page[];
};

type Page = {
  path: string;
  title: string;
  content: string;
};
