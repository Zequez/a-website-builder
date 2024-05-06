import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { compile } from 'json-schema-to-typescript';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const MARKER = '/* GENERATED */';

// ***********

generatePipeApiHelpers();
generateConfigSchemaTypings();
generateTypingsFromDbSchema();

simpleWatch('./templates/genesis/config-schema.ts', generateConfigSchemaTypings);
simpleWatch('./server/api/functions.ts', generatePipeApiHelpers, 2000);

// ***********

function generatePipeApiHelpers() {
  const content = fs.readFileSync('./server/api/functions.ts', 'utf8');
  const m = content.match(/async \$[a-z]+\(/gi);
  if (m) {
    const functions = m.map((s) => s.slice(7, -1));
    const generated = functions.map(functionToApiDefinition).join('\n');
    const pipesContent = fs.readFileSync('./templates/genesis/lib/pipes.ts', 'utf8');
    const [firstPart] = pipesContent.split(MARKER);

    fs.writeFileSync('./templates/genesis/lib/pipes.ts', `${firstPart}${MARKER}\n\n${generated}`);
    console.log('Pipes helpers regenerated');
  }
}

async function generateConfigSchemaTypings() {
  const { default: config, page } = await freshImport('../templates/genesis/config-schema.ts');

  if (page && config) {
    const pageType = await compile(page, 'Page', { bannerComment: '' });
    const configType = await compile(config, 'Config', { bannerComment: '' });

    function replacePageType(s: string) {
      return s.replace(/pages: {([^]*)}\[\];/, `pages: Page[];`);
    }

    fs.writeFileSync(
      './templates/genesis/config.d.ts',
      `${MARKER}\n\n${interfaceToType(pageType)}\n\n${replacePageType(interfaceToType(configType))}`,
    );

    console.log('Config types regenerated');
  }
}

function generateTypingsFromDbSchema() {
  exec(`pnpm pg-to-ts generate -c ${process.env.DEV_DATABASE_URL} -o ./server/db/schema.ts`, () => {
    const schema = fs.readFileSync('./server/db/schema.ts', 'utf8');
    fs.writeFileSync('./server/db/schema.ts', interfaceToType(schema, true));
    console.log('DB Schema types generated');
  });
}

// Utils

function simpleWatch(path: string, cb: () => void, wait: number = 0) {
  fs.watch(path, (eventType, filename) => {
    if (eventType === 'change') {
      setTimeout(() => {
        cb();
      }, wait);
    }
  });
}

async function freshImport(givenPath: string) {
  const schemaPath = path.resolve(__dirname, givenPath);
  const symlinkPath = schemaPath.replace(/\.ts$/, `-${Date.now()}.ts`);
  fs.copyFileSync(schemaPath, symlinkPath);
  const results = await import(symlinkPath);
  fs.rmSync(symlinkPath);
  return results;
}

function functionToApiDefinition(func: string) {
  return `export const ${func} = pipeWrapper<FAT<F['$${func}']>, ART<F['$${func}']>>('${func}');`;
}

function interfaceToType(s: string, exportIt?: boolean) {
  return s.replace(/export interface (.*) {/g, `${exportIt ? 'export ' : ''}type $1 = {`);
}
