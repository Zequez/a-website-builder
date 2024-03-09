/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.elm' {
  export const Elm: {
    [key: string]: {
      init: (config: { node: HTMLElement; flags: Record<string, unknown> }) => void;
    };
  };
}
