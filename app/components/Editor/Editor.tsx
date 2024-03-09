import { useState, useEffect, useCallback } from 'preact/hooks';
import cx from 'classnames';
import EditIcon from '~icons/fa/edit';
import CheckIcon from '~icons/fa/check';
import PlusIcon from '~icons/fa/plus';

import { EditorFile } from './types';
import { filesByName as template } from './template';
import { useFilesystem } from './filesystem';
import { generateIframeEncodedUrl } from './lib/iframeTools';

const Editor = ({ onExit }: { onExit: () => void }) => {
  const {
    files,
    writeFile,
    initialize,
    bucket,
    bucketsNames,
    selectBucket,
    renameBucket,
    createBucket,
    deleteBucket,
  } = useFilesystem();
  const [openFileName, setOpenFileName] = useState<string | null>(Object.keys(files)[0] || null);
  const [iframeRatio, setIframeRatio] = useState(16 / 9);
  const [iframeWidth, setIframeWidth] = useState(360);
  const [editingBucketName, setEditingBucketName] = useState<string | null>(null);

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

  const focusElement = (element: HTMLElement) => {
    if (element) {
      element.focus();
    }
  };

  // useEffect(() => {
  //   if (editingBucketNameRef.current) {
  //     editingBucketNameRef.current.focus();
  //   }
  // }, [editingBucketName]);

  const onFileClick = (fileName: string) => {
    setOpenFileName(fileName);
  };

  const onEditorContentChanges = (content: string) => {
    if (openFileName) {
      writeFile(openFileName, content);
    }
  };

  const applyNewBucketName = () => {
    if (editingBucketName) {
      renameBucket(editingBucketName);
      setEditingBucketName(null);
    }
  };

  const bucketHasIndex = !!files['index.html'];

  const openFile = openFileName ? files[openFileName] : null;

  const iframeEncodedUrl = bucketHasIndex ? generateIframeEncodedUrl(files) : '';

  return (
    <div class="fixed h-full w-full bg-emerald-100 flex">
      <div class="w-40 bg-gray-500 flex flex-col">
        <div class="flex flex-col">
          <div class="text-white text-center text-lg">Sites</div>
          {bucketsNames.map((b) => (
            <div class="flex border-b border-b-black/20">
              {editingBucketName !== null && b === bucket ? (
                <input
                  class="block flex-grow px-2 py-1 bg-white min-w-0"
                  type="text"
                  value={editingBucketName}
                  onKeyUp={({ key }) => key === 'Enter' && applyNewBucketName()}
                  onChange={({ currentTarget }) => setEditingBucketName(currentTarget.value)}
                  ref={focusElement as any}
                />
              ) : (
                <button
                  onClick={() => selectBucket(b)}
                  class={cx('flex-grow block px-2 py-1', {
                    'bg-gray-300': b === bucket,
                    'bg-gray-200': b !== bucket,
                  })}
                >
                  {b}
                </button>
              )}
              {b === bucket ? (
                editingBucketName !== null ? (
                  <button
                    class="bg-emerald-400 flex items-center px-1 hover:bg-emerald-300 text-white"
                    onClick={() => applyNewBucketName()}
                  >
                    <CheckIcon />
                  </button>
                ) : (
                  <button
                    class="bg-gray-300 flex items-center px-1 hover:bg-gray-400 hover:text-white"
                    onClick={() => setEditingBucketName(b)}
                  >
                    <EditIcon />
                  </button>
                )
              ) : null}
            </div>
          ))}
          <button
            class="flex items-center justify-center group mt-2 mb-4"
            onClick={() => createBucket()}
          >
            <span class="block flex items-center justify-center text-white bg-emerald-500 group-hover:bg-emerald-400 w-8 h-8 text-xs rounded-full">
              <PlusIcon />
            </span>
          </button>
        </div>
        <div class="flex flex-col flex-grow">
          <div class="text-white text-center text-lg">Files</div>
          {Object.values(files).map(({ name }) => (
            <button
              class={cx('block px-2 py-1 border-b border-b-black/20 bg-gray-200', {
                'bg-gray-300 border-r-8 border-solid border-r-emerald-500': name === openFileName,
              })}
              onClick={() => onFileClick(name)}
            >
              {name}
            </button>
          ))}
        </div>
        {bucketsNames.length > 1 ? (
          <button
            class="bg-orange-500 text-white py-2 uppercase"
            onClick={() => deleteBucket(bucket)}
          >
            Delete site
          </button>
        ) : null}
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
          <div>Preview</div>
          <div class="flex-grow text-center">{bucket}.aweb.club</div>
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
