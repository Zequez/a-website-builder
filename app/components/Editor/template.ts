import { LocalFile, LocalFiles } from './types';

const template: LocalFile[] = [
  {
    id: null,
    name: 'index.html',
    content: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your website</title>
    <link rel="icon" type="image/png" href="./favicon.png" />
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    Hello world
    <script type="module" src="./script.js"></script>
  </body>
</html>`,
  },
  {
    id: null,
    name: 'style.css',
    content: `body { background: red; }`,
  },
  {
    id: null,
    name: 'script.js',
    content: `console.log("Test");`,
  },
];

export const filesByName: LocalFiles = template.reduce<LocalFiles>((acc, file) => {
  acc[file.name] = file;
  return acc;
}, {});

export default template;
