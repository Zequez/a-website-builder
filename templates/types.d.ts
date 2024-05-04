declare module '*.html?raw' {
  const value: string;
  export default value;
}

declare module '*.yml' {
  const value: string;
  export default value;
}

type FirstArgumentType<T> = T extends (arg1: infer U, ...args: any[]) => any ? U : never;

declare namespace preact.JSX {
  interface IntrinsicElements {
    'emoji-picker': EmojiPickerAttributes;
  }
}

interface EmojiPickerAttributes extends preact.JSX.HTMLAttributes<HTMLElement> {}
