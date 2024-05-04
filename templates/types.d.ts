declare module '*.html?raw' {
  const value: string;
  export default value;
}

declare module '*.yml' {
  const value: string;
  export default value;
}

type FirstArgumentType<T> = T extends (arg1: infer U, ...args: any[]) => any ? U : never;
