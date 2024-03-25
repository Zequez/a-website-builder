import { load as loadYaml } from 'js-yaml';
import { BuildContext } from './types.d';

export default function yamlBuilder(context: BuildContext) {
  context.files = context.files.filter((f) => {
    if (f.name.startsWith('data/') && f.name.endsWith('.yml')) {
      const varName = f.name.slice(5, -4);
      try {
        context.vars[varName] = loadYaml(f.content);
      } catch (e) {
        context.errors.push({ e, message: 'Yaml template invalid', file: f });
        console.error('Yaml invalid', e);
        context.vars[varName] = {};
      }
      return false;
    } else {
      return true;
    }
  });
}
