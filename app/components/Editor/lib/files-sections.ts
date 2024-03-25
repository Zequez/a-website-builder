import { LocalFile } from '../types';

export type Section = {
  icon: string;
  title: string;
  dir: string;
  extract: (files: LocalFile[]) => LocalFile[];
  nameWrap: (name: string) => string;
  nameUnwrap: (name: string) => string;
};

export function extractFiles(dir: string, ext: string | null, files: LocalFile[]): LocalFile[] {
  const [filteredFiles, remainingFiles] = files.reduce(
    ([filteredFiles, remainingFiles], file) => {
      if (file.name.startsWith(dir) && (!ext || file.name.endsWith(ext))) {
        filteredFiles.push(file);
      } else {
        remainingFiles.push(file);
      }
      return [filteredFiles, remainingFiles];
    },
    [[], []] as [LocalFile[], LocalFile[]],
  );

  files.length = 0;
  files.push(...remainingFiles);

  const sorted = filteredFiles.sort((a, b) => a.name.localeCompare(b.name));
  sorted.forEach((file, i) => {
    if (file.name.match(/index/)) {
      sorted.unshift(...sorted.splice(i, 1));
    }
  });
  return sorted;
}

function wrapWith(dir: string, ext: string | null, name: string) {
  return `${dir}/${name}${ext ? `.${ext}` : ''}`;
}

function unwrapFrom(dir: string, ext: string | null, name: string) {
  let unwrapped = name.replace(new RegExp(`^${dir}/`), '');
  return ext ? unwrapped.replace(new RegExp(`\\.${ext}$`), '') : unwrapped;
}

// class SSection {
//   icon: string;
//   title: string;
//   dir: string;
//   nameWrap: (name: string) => string;
//   nameUnwrap: (name: string) => string;
//   extract: (files: LocalFile[]) => LocalFile[];
//   constructor(icon: string, title: string, dir: string, ext?: string) {
//     this.icon = section.icon;
//     this.title = section.title;
//     this.dir = section.dir;
//     this.nameWrap = section.nameWrap;
//     this.nameUnwrap = section.nameUnwrap;
//     this.extract = section.extract;
//   }
// }

export const sections: { [key: string]: Section } = {
  components: {
    icon: '📦',
    title: 'Components',
    dir: 'components',
    extract: extractFiles.bind(null, 'components', 'jsx'),
    nameWrap: wrapWith.bind(null, 'components', 'jsx'),
    nameUnwrap: unwrapFrom.bind(null, 'components', 'jsx'),
  },
  pages: {
    icon: '📜',
    title: 'Pages',
    dir: 'pages',
    extract: extractFiles.bind(null, 'pages', 'jsx'),
    nameWrap: wrapWith.bind(null, 'pages', 'jsx'),
    nameUnwrap: unwrapFrom.bind(null, 'pages', 'jsx'),
  },
  media: {
    icon: '🖼',
    title: 'Media',
    dir: 'media',
    extract: extractFiles.bind(null, 'media', null),
    nameWrap: wrapWith.bind(null, 'media', null),
    nameUnwrap: unwrapFrom.bind(null, 'media', null),
  },
  data: {
    icon: '🗃',
    title: 'Data',
    dir: 'data',
    extract: extractFiles.bind(null, 'data', 'yml'),
    nameWrap: wrapWith.bind(null, 'data', 'yml'),
    nameUnwrap: unwrapFrom.bind(null, 'data', 'yml'),
  },
  other: {
    icon: '🎨',
    title: 'Other',
    dir: 'other',
    extract: (files: LocalFile[]) => files.splice(0, files.length),
    nameWrap: wrapWith.bind(null, 'other', null),
    nameUnwrap: unwrapFrom.bind(null, 'other', null),
  },
};

export function relocateFiles<T>(files: (T & { name: string })[]): typeof files {
  const updates: typeof files = [];
  files.forEach((file) => {
    file.name.endsWith('.html');
    let newName = file.name;
    if (file.name.endsWith('.html')) {
      newName = newName.replace(/\.html$/, '.jsx');
    }
    if (!newName.match('/')) {
      if (newName.endsWith('.jsx')) {
        newName = `pages/${newName}`;
      } else {
        newName = `other/${newName}`;
      }
    }
    if (file.name !== newName) {
      updates.push({ ...file, name: newName });
    }
  });
  return updates;
}

export const filesBySection = (files: LocalFile[]): { [key: string]: LocalFile[] } => {
  const filesCopy = [...files];
  const filesBySection: { [key: string]: LocalFile[] } = {};
  for (let key in sections) {
    const section = sections[key];
    filesBySection[key] = section.extract(filesCopy);
  }
  return filesBySection;
};
