import nunjucks from 'nunjucks';
import { LocalFile } from '../types';
import { load as loadYaml } from 'js-yaml';
import { Eta } from 'eta';

type BuildFile = {
  name: string;
  content: string;
};

type BuildContext = {
  files: BuildFile[];
  vars: Record<string, any>;
  errors: string[];
};

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

function EtaBuilder(context: BuildContext) {
  class CustomEta extends Eta {
    readFile = function (path: string) {
      const file = context.files.find((f) => f.name === path);
      return file ? file.content : '';
    };

    resolvePath = function (templatePath: string, options?: any) {
      return templatePath;
    };
  }
  const eta = new CustomEta();
  function resolveDeps(content: string) {
    return content.match(/layout\(["']([^)]+)["']\)/);
  }

  context.files = context.files.filter((file) => {
    if (file.name.startsWith('layouts/') && file.name.endsWith('.eta')) {
      const name = file.name.slice(8, -4);
      eta.loadTemplate(`@${name}`, file.content);
      return false;
    } else {
      return true;
    }
  });

  context.files = context.files.filter((file) => {
    if (file.name.startsWith('components/') && file.name.endsWith('.eta')) {
      const name = file.name.slice(11, -4);
      console.log('Loaded component', name);
      eta.loadTemplate(`@${name}`, file.content);
      return false;
    } else {
      return true;
    }
  });

  const toAdd: BuildFile[] = [];
  context.files = context.files.filter((f) => {
    if (f.name.startsWith('pages/') && f.name.endsWith('.eta')) {
      const name = f.name.slice(6, -4);
      toAdd.push({ name: `${name}.html`, content: eta.render(f.name, context.vars) });
      return false;
    } else {
      return true;
    }
    //   if (f.name.endsWith('.eta')) {
    //     const varName = f.name.slice(0, -4);
    //     context.files.splice(i, 1);
    //     try {
    //       context.vars[varName] = nunjucks.compile(f.content);
    //     } catch (e) {
    //       context.errors.push('Nunjucks template invalid');
    //       console.log('Nunjucks invalid', e);
    //       context.vars[varName] = {};
    //     }
    //   }
  });

  context.files = context.files.concat(toAdd);
}

export default async function build(files: LocalFile[]): Promise<BuildFile[] | null> {
  const context = { files: [...files], vars: {}, errors: [] };
  YamlBuilder(context);
  EtaBuilder(context);
  console.log(context);
  //   const generatedFiles = { ...files };
  //   const njkContext: Record<string, any> = {};

  //   if (generatedFiles['config.yml']) {
  //     try {
  //       const config = loadYaml(generatedFiles['config.yml'].content);
  //       njkContext.config = config;
  //     } catch (e) {
  //       console.error('Yaml invalid', e);
  //     }
  //   }

  //   if (generatedFiles['layout.njk']) {
  //     try {
  //       njkContext.layout = nunjucks.compile(generatedFiles['layout.njk'].content);
  //       // generatedFiles['layout.html'] = { id: null, name: 'layout.html', content: fileTemplate };
  //     } catch (e) {
  //       console.error('Nunjucks template invalid', e);
  //     }
  //   }

  //   console.log('NJK Context', njkContext);

  //   delete generatedFiles['config.yml'];
  //   delete generatedFiles['layout.yml'];

  //   for (let fileName in generatedFiles) {
  //     if (fileName.endsWith('.njk')) {
  //       try {
  //         const fileTemplate = nunjucks.renderString(generatedFiles[fileName].content, njkContext);
  //         const compiledName = fileName.replace(/\.njk$/, '.html');
  //         generatedFiles[compiledName] = { id: null, name: compiledName, content: fileTemplate };
  //         delete generatedFiles[fileName];
  //       } catch (e) {
  //         console.error('Nunjucks template invalid', e);
  //       }
  //     } else {
  //       generatedFiles[fileName] = files[fileName];
  //     }
  //   }
  return Promise.resolve(context.files);
}
