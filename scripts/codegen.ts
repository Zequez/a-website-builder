import * as fs from 'fs';

function functionToApiDefinition(func: string) {
  return `export const ${func} = pipeWrapper<FAT<F['$${func}']>, ART<F['$${func}']>>('${func}');`;
}

const MARKER = '/* GENERATED */';

function generatePipeApiHelpers() {
  const content = fs.readFileSync('./server/routes/api/functions.ts', 'utf8');
  const m = content.match(/\$[a-z]+\(/gi);
  if (m) {
    const functions = m.map((s) => s.slice(1, -1));
    const generated = functions.map(functionToApiDefinition).join('\n');
    const pipesContent = fs.readFileSync('./templates/genesis/lib/pipes.ts', 'utf8');
    const [firstPart] = pipesContent.split(MARKER);

    fs.writeFileSync('./templates/genesis/lib/pipes.ts', `${firstPart}${MARKER}\n\n${generated}`);
    console.log('Pipes helpers regenerated');
  }
}

generatePipeApiHelpers();

fs.watch('./server/routes/api/functions.ts', (eventType, filename) => {
  if (eventType === 'change') {
    generatePipeApiHelpers();
  }
});
