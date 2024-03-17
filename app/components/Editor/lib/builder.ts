import nunjucks from 'nunjucks';
import { LocalFiles } from '../types';
import { load as loadYaml } from 'js-yaml';

export async function build(files: LocalFiles): Promise<LocalFiles> {
  const generatedFiles = { ...files };
  const njkContext: Record<string, any> = {};

  if (generatedFiles['config.yml']) {
    try {
      const config = loadYaml(generatedFiles['config.yml'].content);
      njkContext.config = config;
    } catch (e) {
      console.error('Yaml invalid', e);
    }
  }

  if (generatedFiles['layout.njk']) {
    try {
      njkContext.layout = nunjucks.compile(generatedFiles['layout.njk'].content);
      // generatedFiles['layout.html'] = { id: null, name: 'layout.html', content: fileTemplate };
    } catch (e) {
      console.error('Nunjucks template invalid', e);
    }
  }

  console.log('NJK Context', njkContext);

  delete generatedFiles['config.yml'];
  delete generatedFiles['layout.yml'];

  for (let fileName in generatedFiles) {
    if (fileName.endsWith('.njk')) {
      try {
        const fileTemplate = nunjucks.renderString(generatedFiles[fileName].content, njkContext);
        const compiledName = fileName.replace(/\.njk$/, '.html');
        generatedFiles[compiledName] = { id: null, name: compiledName, content: fileTemplate };
        delete generatedFiles[fileName];
      } catch (e) {
        console.error('Nunjucks template invalid', e);
      }
    } else {
      generatedFiles[fileName] = files[fileName];
    }
  }
  return Promise.resolve(generatedFiles);
}
