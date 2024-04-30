// This file gets override by the build script with the latest templates directly hardcoded
// because on Vercel you cannot read directories

import path from 'path';
import fs from 'fs';

const templatesDir = fs.readdirSync(path.join('dist', 'templates'));
const availableTemplates = templatesDir.filter((name) => name !== 'assets');
const templateIndexes: { [key: string]: string } = {};
for (let templateKey of availableTemplates) {
  templateIndexes[templateKey] = fs.readFileSync(
    path.join('dist', 'templates', templateKey, 'index.html'),
    'utf8',
  );
}

export default templateIndexes;
