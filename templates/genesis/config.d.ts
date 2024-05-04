type Config = {
  title: string;
  subdomain: string;
  domain: string;
  description: string;
  themeColor: string;
  pages: Page[];
};

type Page = {
  uuid: string;
  path: string;
  title: string;
  icon: string;
  onNav: boolean;
  content: string;
};
