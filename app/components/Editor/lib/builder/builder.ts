import { LocalFile } from '../../types';
import { BuildFile, BuildContext } from './types.d';

import yamlBuilder from './yamlBuilder';
import htmlBuilder from './htmlBuilder';
import unoCssBuilder from './unocssBuilder';
import emojiFaviconBuilder from './htmlBuilder/emojiFaviconBuilder';

export default async function build(files: LocalFile[]): Promise<BuildContext> {
  const context = { files: [...files], vars: {}, errors: [] };
  yamlBuilder(context);
  htmlBuilder(context);
  emojiFaviconBuilder(context);
  await unoCssBuilder(context);
  return Promise.resolve(context);
}
