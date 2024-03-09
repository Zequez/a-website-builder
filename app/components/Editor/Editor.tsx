import { useState, useEffect } from 'preact/hooks';
import cx from 'classnames';

import { EditorFile } from './types';
import { filesByName as template } from './template';
import { useFilesystem } from './filesystem';
import { generateIframeEncodedUrl } from './lib/iframeTools';

const Editor = ({ onExit }: { onExit: () => void }) => {
  const { files, writeFile, initialize } = useFilesystem('default');
  const [openFileName, setOpenFileName] = useState<string | null>(Object.keys(files)[0] || null);
  const [iframeRatio, setIframeRatio] = useState(16 / 9);
  const [iframeWidth, setIframeWidth] = useState(360);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  useEffect(() => {
    if (Object.keys(files).length === 0) {
      initialize(template);
      setOpenFileName(Object.keys(template)[0] || null);
    }
  }, []);

  const onFileClick = (fileName: string) => {
    setOpenFileName(fileName);
  };

  const onEditorContentChanges = (content: string) => {
    if (openFileName) {
      writeFile(openFileName, content);
    }
  };

  const openFile = openFileName ? files[openFileName] : null;

  const iframeEncodedUrl = generateIframeEncodedUrl(files);

  return (
    <div class="fixed h-full w-full bg-emerald-100 flex">
      <div class="w-40 bg-gray-500 flex flex-col">
        <div class="flex flex-col flex-grow">
          {Object.values(files).map(({ name }) => (
            <button
              class={cx('block px-2 py-1 border-b border-b-black/20 bg-gray-200', {
                'bg-gray-300': name === openFileName,
              })}
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
      {openFile ? (
        <textarea
          class="flex-grow p-4 bg-gray-700 text-white font-mono"
          value={openFile.content}
          onChange={({ currentTarget }) => onEditorContentChanges(currentTarget.value)}
        ></textarea>
      ) : (
        <div class="flex flex-grow items-center justify-center text-2xl text-black opacity-50">
          No file open
        </div>
      )}
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
