// This file gets override by the build script with the latest templates directly hardcoded
// because on Vercel you cannot read directories

import path from 'path';
import fs from 'fs';

const templateIndexes: { [key: string]: string } = {};
templateIndexes['genesis'] = fs.readFileSync(path.join('dist', 'templates', 'index.html'), 'utf8');

export default templateIndexes;
