import { useState, useEffect } from 'preact/hooks';
import { parse } from 'node-html-parser';

type EditorFile = {
  name: string;
  content: string;
};

const TEMPLATE: EditorFile[] = [
  {
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
    name: 'style.css',
    content: `body { background: red; }`,
  },
  {
    name: 'script.js',
    content: `console.log("Test");`,
  },
];

const filesByName = TEMPLATE.reduce<Record<string, EditorFile>>((acc, file) => {
  acc[file.name] = file;
  return acc;
}, {});

function contentToDataUrl(mime: string, content: string) {
  return `data:${mime};base64,${btoa(content)}`;
}

function generateIframeEncodedUrl(files: { [key: string]: EditorFile }) {
  const indexContent = files['index.html'].content;
  const root = parse(indexContent);
  root.querySelectorAll('link[rel="stylesheet"]').map((el) => {
    const href = el.getAttribute('href');
    if (href?.startsWith('./')) {
      const fileName = href.slice(2);
      if (files[fileName]) {
        el.setAttribute('href', contentToDataUrl('text/css', files[fileName].content));
      }
    }
  });

  root.querySelectorAll('script[type="module"]').map((el) => {
    const src = el.getAttribute('src');
    if (src?.startsWith('./')) {
      const fileName = src.slice(2);
      if (files[fileName]) {
        el.setAttribute('src', contentToDataUrl('text/javascript', files[fileName].content));
      }
    }
  });

  return contentToDataUrl('text/html', root.innerHTML);
}

const Editor = ({ onExit }: { onExit: () => void }) => {
  const [files, setFiles] = useState<{ [key: string]: EditorFile }>(filesByName);
  const [openFileName, setOpenFileName] = useState<string>('index.html');
  const [iframeRatio, setIframeRatio] = useState(16 / 9);
  const [iframeWidth, setIframeWidth] = useState(360);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const onFileClick = (fileName: string) => {
    setOpenFileName(fileName);
  };

  const onEditorContentChanges = (content: string) => {
    setFiles({ ...files, [openFileName]: { ...files[openFileName], content } });
  };

  const openFile = files[openFileName];

  const iframeEncodedUrl = generateIframeEncodedUrl(files);

  return (
    <div class="fixed h-full w-full bg-emerald-100 flex">
      <div class="w-40 bg-gray-500 flex flex-col">
        <div class="flex flex-col flex-grow">
          {Object.values(files).map(({ name }) => (
            <button
              class="block px-2 py-1 border-b border-b-black/20 bg-gray-200"
              onClick={() => onFileClick(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <button class="bg-red-500 text-white py-1 uppercase" onClick={onExit}>
          Exit
        </button>
      </div>
      <textarea
        class="flex-grow p-4 bg-gray-700 text-white font-mono"
        value={openFile.content}
        onChange={({ currentTarget }) => onEditorContentChanges(currentTarget.value)}
      ></textarea>
      <div class="fixed bottom-2 right-2 bg-gray-200 rounded-t-md" style={{ width: iframeWidth }}>
        <div class="px-2 py-1 flex text-gray-500">
          <div class="flex-grow">Preview</div>
          <div>100%</div>
        </div>
        <iframe
          class="bg-white"
          src={iframeEncodedUrl}
          style={{ width: '100%', height: iframeWidth * iframeRatio }}
        ></iframe>
      </div>
    </div>
  );
};

export default Editor;
