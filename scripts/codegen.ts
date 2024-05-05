import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { compile } from 'json-schema-to-typescript';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

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

async function freshImport(givenPath: string) {
  const schemaPath = path.resolve(__dirname, givenPath);
  const symlinkPath = schemaPath.replace(/\.ts$/, `-${Date.now()}.ts`);
  // const symlinkPath = path.join(os.tmpdir(), `${Date.now()}.ts`);
  fs.copyFileSync(schemaPath, symlinkPath);
  const results = await import(symlinkPath);
  fs.rmSync(symlinkPath);
  return results;
}

async function generateConfigSchemaTypings() {
  const { default: config, page } = await freshImport('../templates/genesis/config-schema.ts');

  if (page && config) {
    const pageType = await compile(page, 'Page', { bannerComment: '' });
    const configType = await compile(config, 'Config', { bannerComment: '' });

    function fix(s: string) {
      return s.replace(/export interface (.*) {/, 'type $1 = {');
    }

    function replacePageType(s: string) {
      return s.replace(/pages: {([^]*)}\[\];/, `pages: Page[];`);
    }

    fs.writeFileSync(
      './templates/genesis/config.d.ts',
      `${MARKER}\n\n${fix(pageType)}\n\n${replacePageType(fix(configType))}`,
    );

    console.log('Config types regenerated');
  }
}

generateConfigSchemaTypings();

fs.watch('./templates/genesis/config-schema.ts', async (eventType, filename) => {
  if (eventType === 'change') {
    generateConfigSchemaTypings();
  }
});
