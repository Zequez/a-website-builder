/* GENERATED */

type Page = {
  uuid: string;
  path: string;
  title: string;
  icon: string;
  onNav: boolean;
  content: string;
}


type Config = {
  title: string;
  description: string;
  themeColor: string;
  icon: {
    type: "emoji";
    value: string;
  };
  domain: string;
  subdomain: string;
  pages: Page[];
}
