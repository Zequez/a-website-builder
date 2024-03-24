import { LocalFile } from '../../types';
import { load as loadYaml } from 'js-yaml';

import { BuildFile, BuildContext } from './types.d';

import htmlBuilder from './htmlBuilder';

function YamlBuilder(context: BuildContext) {
  context.files = context.files.filter((f) => {
    if (f.name.startsWith('data/') && f.name.endsWith('.yml')) {
      const varName = f.name.slice(5, -4);
      try {
        context.vars[varName] = loadYaml(f.content);
      } catch (e) {
        context.errors.push('Yaml template invalid');
        console.error('Yaml invalid', e);
        context.vars[varName] = {};
      }
      return false;
    } else {
      return true;
    }
  });
}

export default async function build(files: LocalFile[]): Promise<BuildFile[] | null> {
  const context = { files: [...files], vars: {}, errors: [] };
  YamlBuilder(context);
  htmlBuilder(context);
  return Promise.resolve(context.files);
}
