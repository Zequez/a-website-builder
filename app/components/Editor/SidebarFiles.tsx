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
  onRenameFile,
}: {
  files: EditorFiles;
  openedFileName: string | null;
  onOpenFile: (fileName: string) => void;
  onAddFile: (fileName: string) => void;
  onApplyTemplate: (template: EditorFiles) => void;
  onRenameFile: (fileName: string, newFileName: string) => void;
}) {
  const [newFileName, setNewFileName] = useState<null | string>(null);
  const [renameFile, setRenameFile] = useState<null | string>(null);
  const [renameFileName, setRenameFileName] = useState<null | string>(null);

  function handleRenameFileStart(fileName: string) {
    setRenameFile(fileName);
    setRenameFileName(fileName);
  }

  function handleRenameFileApply() {
    if (!renameFileName) return;
    if (!renameFile) return;
    if (renameFile !== renameFileName) {
      onRenameFile(renameFile, renameFileName);
    }
    setRenameFile(null);
    setRenameFileName(null);
  }

  function handleCancelRenameFile() {
    setRenameFile(null);
    setRenameFileName(null);
  }

  function handleAddFileStart() {
    setNewFileName('');
  }

  function handleAddFileApply() {
    if (!newFileName) return;
    onAddFile(newFileName);
    setNewFileName(null);
  }

  function handleCancelNewFile() {
    setNewFileName(null);
  }

  const fileAlreadyExists = newFileName ? !!files[newFileName] : false;
  const newFileNameIsValid = !fileAlreadyExists && !!(newFileName && newFileName.length > 0);

  const renameFileAlreadyExists = renameFileName
    ? renameFileName !== renameFile && !!files[renameFileName]
    : false;
  const renameFileNameIsValid =
    !renameFileAlreadyExists && !!(renameFileName && renameFileName.length > 0);

  return (
    <div class="flex flex-col flex-grow">
      <div class="text-white text-center text-lg my-2">Files</div>

      {Object.values(files).map(({ name }) =>
        renameFileName !== null && renameFile === name ? (
          <FileNamer
            name={renameFileName}
            onChange={setRenameFileName}
            isValid={renameFileNameIsValid}
            onApply={handleRenameFileApply}
            onCancel={handleCancelRenameFile}
          />
        ) : (
          <button
            class={cx('block px-2 py-1 border-b border-b-black/20', {
              'bg-black/40 text-white/70 shadow-md shadow-inset': name === openedFileName,
              'bg-white/80 text-black/80 hover:bg-white/90': name !== openedFileName,
            })}
            onClick={() => onOpenFile(name)}
            onDblClick={() => handleRenameFileStart(name)}
          >
            {name}
          </button>
        ),
      )}
      {newFileName !== null ? (
        <FileNamer
          name={newFileName}
          onChange={setNewFileName}
          isValid={newFileNameIsValid}
          onApply={handleAddFileApply}
          onCancel={handleCancelNewFile}
        />
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

function FileNamer({
  name,
  onChange,
  isValid,
  onApply,
  onCancel,
}: {
  name: string;
  onChange: (val: string) => void;
  isValid: boolean;
  onApply: () => void;
  onCancel: () => void;
}) {
  return (
    <div class="flex">
      <input
        class="px-2 py-1 block flex-grow min-w-0"
        placeholder="Name your file"
        value={name}
        onChange={({ currentTarget }) => onChange(currentTarget.value)}
        onKeyDown={({ key }) =>
          key === 'Enter' && isValid ? onApply() : key === 'Escape' ? onCancel() : null
        }
        ref={(el) => el?.focus()}
      />
      {isValid ? (
        <button
          class="bg-emerald-400 flex items-center px-1 hover:bg-emerald-300 text-white"
          onClick={onApply}
        >
          <CheckIcon />
        </button>
      ) : (
        <button
          class="bg-red-400 hover:bg-red-300 flex items-center px-1 text-white"
          onClick={onCancel}
        >
          <TimesIcon />
        </button>
      )}
    </div>
  );
}
