export const colorConsole = {
  green: (text: string) => console.log('\x1b[32m%s\x1b[0m', text),
  greenBg: (text: string) => console.log('\x1b[42m%s\x1b[0m', text),
  red: (text: string) => console.log('\x1b[31m%s\x1b[0m', text),
};
