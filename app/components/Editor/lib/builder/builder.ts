import { LocalFile } from '../../types';
import { BuildFile, BuildContext } from './types.d';

import yamlBuilder from './yamlBuilder';
import htmlBuilder from './htmlBuilder';
import unoCssBuilder from './unocssBuilder';

export default async function build(files: LocalFile[]): Promise<BuildFile[] | null> {
  const context = { files: [...files], vars: {}, errors: [] };
  yamlBuilder(context);
  htmlBuilder(context);
  await unoCssBuilder(context);
  return Promise.resolve(context.files);
}
