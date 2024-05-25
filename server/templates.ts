// This file gets override by the build script with the latest templates directly hardcoded
// because on Vercel you cannot read directories

import path from 'path';
import fs from 'fs';

const templates = {
  get genesis() {
    return fs.readFileSync(path.join('dist', 'app', 'index.html'), 'utf8');
  },
};

export default templates;
