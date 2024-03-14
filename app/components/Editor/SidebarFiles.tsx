import PlusIcon from '~icons/fa/plus';
import CheckIcon from '~icons/fa/check';
import TimesIcon from '~icons/fa/times';
import { cx } from '@app/lib/utils';
import { filesByName as template } from './template';
import { EditorFiles } from './types';
import { useState } from 'preact/hooks';

export default function SidebarFiles({
  files,
  openedFileName,
  onOpenFile,
  onAddFile,
  onApplyTemplate,
}: {
  files: EditorFiles;
  openedFileName: string | null;
  onOpenFile: (fileName: string) => void;
  onAddFile: (fileName: string) => void;
  onApplyTemplate: (template: EditorFiles) => void;
}) {
  const [newFileName, setNewFileName] = useState<null | string>(null);

  function handleAddFileStart() {
    setNewFileName('');
  }

  function handleAddFileApply() {
    if (!newFileName) return;
    onAddFile(newFileName);
    setNewFileName(null);
  }

  const fileAlreadyExists = newFileName ? !!files[newFileName] : false;
  const newFileNameIsValid = !fileAlreadyExists && newFileName && newFileName.length > 0;

  return (
    <div class="flex flex-col flex-grow">
      <div class="text-white text-center text-lg my-2">Files</div>

      {Object.values(files).map(({ name }) => (
        <button
          class={cx('block px-2 py-1 border-b border-b-black/20 bg-gray-200', {
            'bg-gray-300 border-r-8 border-solid border-r-emerald-500': name === openedFileName,
          })}
          onClick={() => onOpenFile(name)}
        >
          {name}
        </button>
      ))}
      {newFileName !== null ? (
        <div class="flex">
          <input
            class="px-2 py-1 block flex-grow min-w-0"
            placeholder="Name your file"
            value={newFileName}
            onChange={({ currentTarget }) => setNewFileName(currentTarget.value)}
            onKeyDown={({ key }) =>
              key === 'Enter' && newFileNameIsValid ? handleAddFileApply() : null
            }
            ref={(el) => el?.focus()}
          />
          {newFileNameIsValid ? (
            <button
              class="bg-emerald-400 flex items-center px-1 hover:bg-emerald-300 text-white"
              onClick={handleAddFileApply}
            >
              <CheckIcon />
            </button>
          ) : (
            <div class="bg-red-400 flex items-center px-1 text-white">
              <TimesIcon />
            </div>
          )}
        </div>
      ) : null}
      {Object.keys(files).length === 0 ? (
        <div class="flex items-center justify-center">
          <button
            class="bg-emerald-500 hover:bg-emerald-400 px-2 py-1 text-white rounded-md uppercase tracking-wider mb-2"
            onClick={() => onApplyTemplate(template)}
          >
            Use template
          </button>
        </div>
      ) : null}
      <button class="flex items-center justify-center group mt-2 mb-4" onClick={handleAddFileStart}>
        <span class="block flex items-center justify-center text-white bg-emerald-500 group-hover:bg-emerald-400 w-8 h-8 text-xs rounded-full">
          <PlusIcon />
        </span>
      </button>
    </div>
  );
}
