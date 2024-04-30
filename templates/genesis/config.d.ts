type Config = {
  title: string;
  foo: boolean;
  pages: {
    [key: string]: {
      title: string;
      content: string;
    };
  };
};
