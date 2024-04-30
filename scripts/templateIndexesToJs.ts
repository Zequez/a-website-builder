import templatesIndexes from '@server/templates';
import path from 'path';
import fs from 'fs';

const templateFile = `export default ${JSON.stringify(templatesIndexes)}`;

fs.writeFileSync(path.join('dist/ts/server/templates.js'), templateFile);
