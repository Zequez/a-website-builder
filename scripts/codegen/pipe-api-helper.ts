import * as fs from 'fs';
import { MARKER } from './utils';

export function generate() {
  const content = fs.readFileSync('./server/api/functions.ts', 'utf8');
  const m = content.match(/async \$[a-z]+\(/gi);
  if (m) {
    const functions = m.map((s) => s.slice(7, -1));
    const generated = functions.map(functionToApiDefinition).join('\n');
    const pipesContent = fs.readFileSync('./app/src/lib/pipes.ts', 'utf8');
    const [firstPart] = pipesContent.split(MARKER);

    fs.writeFileSync('./app/src/lib/pipes.ts', `${firstPart}${MARKER}\n\n${generated}`);
    console.log('Pipes helpers regenerated');
  }
}

export function watch() {
  generate();
  simpleWatch('./server/api/functions.ts', generate, 2000);
}

function simpleWatch(path: string, cb: () => void, wait: number = 0) {
  fs.watch(path, (eventType, filename) => {
    if (eventType === 'change') {
      setTimeout(() => {
        cb();
      }, wait);
    }
  });
}

function functionToApiDefinition(func: string) {
  return `export const ${func} = pipeWrapper<FAT<F['$${func}']>, ART<F['$${func}']>>('${func}');`;
}
