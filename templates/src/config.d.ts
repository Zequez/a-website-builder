/* GENERATED */

type PageElementConfig = TextElementConfig | ImageElementConfig;

type Config = {
  version: 1;
  title: string;
  description: string;
  header: {
    imageUrl: string;
  };
  theme: {
    hue: number;
    saturation: number;
    lightness: number;
    pattern: "noise" | "none";
    patternIntensity: number;
  };
  icon: {
    type: "emoji";
    value: string;
  };
  domain: string;
  subdomain: string;
  pages: PageConfig[];
}
type PageConfig = {
  version?: 1;
  uuid: string;
  path: string;
  title: string;
  icon: string;
  onNav: boolean;
  elements: PageElementConfig[];
}
type TextElementConfig = {
  version: 1;
  uuid: string;
  type: "Text";
  value: string;
  compiledValue: string;
  boxColor: string;
}
type ImageElementConfig = {
  version: 1;
  uuid: string;
  type: "Image";
  url: {
    large: string;
    medium: string;
    small: string;
  };
  displaySize: "original" | "1/3" | "1/2" | "2/3" | "full" | "extra";
  originalSize: {
    width: number;
    height: number;
  };
}
