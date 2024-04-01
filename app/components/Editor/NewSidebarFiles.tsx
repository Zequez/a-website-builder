import CheckIcon from '~icons/fa6-solid/check';
import MenuEllipsis from '~icons/fa6-solid/ellipsis';
import PlusIcon from '~icons/fa6-solid/plus';
import TimesIcon from '~icons/fa6-solid/xmark';

import { cx } from '@app/lib/utils';
import { keyBy } from '@shared/utils';
import { useRef, useState } from 'preact/hooks';
import FloatingMenu from '../FloatingMenu';
import template from './template';
import { LocalFile } from './types';
import { sections, filesBySection, Section } from './lib/files-sections';

export default function SidebarFiles({
  files,
  selectedFileId,
  onOpenFile,
  onAddFile,
  onApplyTemplate,
  onRenameFile,
  onDeleteFile,
  unsavedFilesIds,
}: {
  files: LocalFile[];
  selectedFileId: string | null;
  onOpenFile: (fileId: string) => void;
  onAddFile: (name: string) => void;
  onApplyTemplate: (template: { name: string; content: string }[]) => void;
  onRenameFile: (fileId: string, newFileName: string) => void;
  onDeleteFile: (fileId: string) => void;
  unsavedFilesIds: string[];
}) {
  // const [newFileName, setNewFileName] = useState<null | string>(null);
  // const [renameFileId, setRenameFileId] = useState<null | string>(null);
  // const [renameFileName, setRenameFileName] = useState<null | string>(null);

  // const filesByName = keyBy(files, 'name');
  // const filesById = keyBy(files, 'id');

  // function handleRenameFileStart(id: string) {
  //   setRenameFileId(id);
  //   setRenameFileName(filesById[id].name);
  // }

  // function handleRenameFileApply() {
  //   if (!renameFileName) return;
  //   if (!renameFileId) return;
  //   if (filesById[renameFileId].name !== renameFileName) {
  //     onRenameFile(renameFileId, renameFileName);
  //   }
  //   setRenameFileId(null);
  //   setRenameFileName(null);
  // }

  // function handleCancelRenameFile() {
  //   setRenameFileId(null);
  //   setRenameFileName(null);
  // }

  // function handleAddFileStart() {
  //   setNewFileName('');
  // }

  // function handleAddFileApply() {
  //   if (!newFileName) return;
  //   onAddFile(newFileName);
  //   setNewFileName(null);
  // }

  // function handleCancelNewFile() {
  //   setNewFileName(null);
  // }

  function handleDeletePrompt(id: string) {
    if (window.confirm('Are you sure you want to delete this file?')) {
      onDeleteFile(id);
    }
  }

  // const fileAlreadyExists = newFileName ? !!filesByName[newFileName] : false;
  // const newFileNameIsValid = !fileAlreadyExists && !!(newFileName && newFileName.length > 0);

  // const renameFileCurrentName = renameFileId ? filesById[renameFileId].name : null;
  // const renameFileAlreadyExists = renameFileName
  //   ? renameFileName !== renameFileCurrentName && !!filesByName[renameFileName]
  //   : false;
  // const renameFileNameIsValid =
  //   !renameFileAlreadyExists && !!(renameFileName && renameFileName.length > 0);

  const [addingFileOn, setAddingFileOn] = useState<null | Section>(null);
  const [newFileName, setNewFileName] = useState<null | string>(null);

  function handleStartAddFile(section: Section) {
    console.log('Adding to section', section);
    setAddingFileOn(section);
    setNewFileName('');
  }

  function handleAddFile() {
    if (addingFileOn && newFileName) {
      onAddFile(addingFileOn.nameWrap(newFileName));
      setAddingFileOn(null);
      setNewFileName(null);
    }
  }

  function handleCancelAddFile() {
    setAddingFileOn(null);
    setNewFileName(null);
  }

  const sectionedFiles = filesBySection(files);

  return (
    <div class="flex flex-col flex-grow overflow-auto py-4 space-y-1">
      {Object.entries(sections).map(([key, section]) => {
        const { title, icon, dir, nameUnwrap, nameWrap } = section;
        return (
          <div class="mx-1">
            <div class="uppercase tracking-wider text-sm flex p-0.5 bg-black/20 rounded-md">
              <span class="mx-2 py-0.5">{icon}</span>
              <span class="flex-grow py-0.5 text-white/70">{title}</span>
              <button
                class="bg-white/30 text-black/50 outline-none hocus:text-white hocus:glow-lg-sm-white/40 hocus:bg-lime-500 rounded-[0.25rem] font-semibold py-1 px-2 text-xs hover:transition-none transition-background-color,box-shadow duration-500 active:scale-98"
                onClick={({ currentTarget }) => {
                  currentTarget.blur();
                  handleStartAddFile(section);
                }}
              >
                ADD
              </button>
            </div>
            {sectionedFiles[key].length || addingFileOn === section ? (
              <div class="relative text-white mx-1 font-mono py-1.5 bg-black/5  rounded-b-md flex flex-col items-start">
                <div class="absolute inset-0 rounded-b-md border border-t-0 border-black/10 pointer-events-none"></div>
                {sectionedFiles[key].map((file) => {
                  const cleanName = nameUnwrap(file.name);

                  const isSelected = file.id === selectedFileId;
                  const isFixedFile = file.name === 'pages/index.jsx';

                  return (
                    <FileButton
                      isSelected={isSelected}
                      name={file.name}
                      cleanName={cleanName}
                      onSelect={() => onOpenFile(file.id)}
                      isUnsaved={unsavedFilesIds.includes(file.id)}
                      onRename={
                        isFixedFile
                          ? null
                          : (newName: string) => onRenameFile(file.id, nameWrap(newName))
                      }
                      onDelete={isFixedFile ? null : () => handleDeletePrompt(file.id)}
                    />
                  );
                })}
                {addingFileOn === section && newFileName !== null ? (
                  <div class="w-full flex h-6">
                    <NewFileNamer
                      name={newFileName}
                      onChange={setNewFileName}
                      isValid={newFileName !== ''}
                      onApply={handleAddFile}
                      onCancel={handleCancelAddFile}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
      {/* {files
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ name, id }) =>
          renameFileName !== null && renameFileId === id ? (
            <FileNamer
              name={renameFileName}
              onChange={setRenameFileName}
              isValid={renameFileNameIsValid}
              onApply={handleRenameFileApply}
              onCancel={handleCancelRenameFile}
            />
          ) : (
            <FileButton
              name={name}
              isSelected={id === selectedFileId}
              onSelect={() => onOpenFile(id)}
              onRenameStart={() => handleRenameFileStart(id)}
              onDelete={() => handleDeletePrompt(id)}
            />
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

      {files.length === 0 ? (
        <div class="flex items-center justify-center mt-4">
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
      </button> */}
    </div>
  );
}

function FileButton({
  isSelected,
  onSelect,
  onRename,
  onDelete,
  name,
  cleanName,
  isUnsaved,
}: {
  isSelected: boolean;
  onSelect: () => void;
  onRename: ((newName: string) => void) | null;
  onDelete: (() => void) | null;
  name: string;
  cleanName: string;
  isUnsaved: boolean;
}) {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const [renamingTo, setRenamingTo] = useState<null | string>(null);

  function onRenameStart() {
    setRenamingTo(cleanName);
  }

  const menuOptions: { [key: string]: () => void } = {};
  if (onRename) {
    menuOptions['Rename'] = onRenameStart;
  }
  if (onDelete) {
    menuOptions['Delete'] = onDelete;
  }

  function handleApplyRename() {
    if (renamingTo !== null) {
      setRenamingTo(null);
      if (renamingTo !== cleanName) {
        onRename?.(renamingTo);
      }
    }
  }

  function handleCancelRename() {
    setRenamingTo(null);
  }

  return (
    <>
      <div class="relative z-20 w-full" title={name} ref={elRef}>
        {isUnsaved ? (
          <div class="absolute inset-0 flex items-center justify-right text-[10px] pointer-events-none tracking-widest font-thin">
            <span class="bg-red-500/20 text-white/50 rounded-md px-1 py-0.25 mr-6">Unsaved</span>
          </div>
        ) : null}
        <div
          class={cx('w-full flex h-6', {
            'hover:bg-black/10': !isSelected,
            'bg-black/40 shadow-inset shadow-sm': isSelected,
          })}
        >
          {renamingTo === null ? (
            <div
              class={cx('flex w-full h-full pl-2', {
                'translate-y-0.25': isSelected,
              })}
            >
              <>
                <button
                  class="block flex-grow flex items-center"
                  onDblClick={() => onRename && onRenameStart()}
                  onClick={onSelect}
                >
                  {cleanName !== 'index' ? (
                    cleanName
                  ) : (
                    <>
                      <span class="opacity-30">(home)</span>
                    </>
                  )}
                </button>
                {Object.keys(menuOptions).length > 0 ? (
                  <button
                    class="h-full flex text-white/40 hover:text-white/80 items-center justify-center px-1 hover:bg-white/10"
                    onClick={() => setMenuIsOpen(true)}
                  >
                    <MenuEllipsis />
                  </button>
                ) : null}
              </>
            </div>
          ) : (
            <NewFileNamer
              name={renamingTo}
              onChange={setRenamingTo}
              isValid={true}
              onApply={handleApplyRename}
              onCancel={handleCancelRename}
            />
          )}
        </div>
      </div>
      {menuIsOpen ? (
        <FloatingMenu
          target={elRef.current!}
          items={menuOptions}
          onClose={() => setMenuIsOpen(false)}
        />
      ) : null}
    </>
  );
}

function NewFileNamer({
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
    <>
      <input
        class="min-w-0 outline-none bg-white/10 h-full pl-2 border border-white/30"
        type="text"
        value={name}
        ref={(el) => el?.focus()}
        onKeyDown={({ key }) =>
          key === 'Enter' ? onApply() : key === 'Escape' ? onCancel() : null
        }
        onChange={({ currentTarget }) => onChange(currentTarget.value)}
      />
      {isValid ? (
        <button
          class="text-white/60 hover:text-white hover:bg-lime-500 px-1 h-full"
          onClick={onApply}
        >
          <CheckIcon />
        </button>
      ) : (
        <button
          class="bg-red-400 hover:bg-red-300 flex items-center px-1 h-full text-white"
          onClick={onCancel}
        >
          <TimesIcon />
        </button>
      )}
    </>
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
