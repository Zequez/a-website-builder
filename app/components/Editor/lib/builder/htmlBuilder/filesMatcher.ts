import { BuildFile } from '../types';

export const openingTagMatcher = (name: string) => new RegExp(`<(${name})`, 'g');
export const closingTagMatcher = (name: string) => new RegExp(`</(${name})>`, 'g');

const MATCH_COMPONENTS = /^components\/(.*)\.jsx$/;
const MATCH_PAGES = /^pages\/(.*)\.(html|jsx|tsx)$/;

function matchFiles(matcher: RegExp, files: BuildFile[]) {
  const filesByName: { [key: string]: BuildFile } = {};
  files.forEach((file) => {
    const m = file.name.match(matcher);
    if (m) {
      filesByName[m[1]] = file;
    }
  });
  return filesByName;
}

export const matchComponents = matchFiles.bind(null, MATCH_COMPONENTS);
export const matchPages = matchFiles.bind(null, MATCH_PAGES);
