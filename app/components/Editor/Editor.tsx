import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import cx from 'classnames';
import CheckIcon from '~icons/fa/check';
import PlusIcon from '~icons/fa/plus';
import MenuEllipsis from '~icons/fa/ellipsis-v';

import FloatingMenu from '../FloatingMenu';

import { EditorFiles, Site } from './types';
import { filesByName as template } from './template';
import { generateIframeEncodedUrl } from './lib/iframeTools';
import useSites from './lib/useSites';

const Editor = ({ onExit }: { onExit: () => void }) => {
  const S = useSites();
  const [selectedSiteLocalId, setSelectedSiteLocalId] = useState<string | null>(null);
  const [openFileName, setOpenFileName] = useState<string | null>(null);
  const [iframeRatio, setIframeRatio] = useState(16 / 9);
  const [iframeWidth, setIframeWidth] = useState(360);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const handleFileClick = (fileName: string) => {
    setOpenFileName(fileName);
  };

  const onEditorContentChanges = (content: string) => {
    if (selectedSiteLocalId && openFileName) {
      S.writeFile(selectedSiteLocalId, openFileName, content);
    }
  };

  const handleSelectSite = (localId: string) => {
    setSelectedSiteLocalId(localId);
    const newSelectedSite = S.byLocalId(localId);
    const firstFile = Object.keys(newSelectedSite.files)[0];
    setOpenFileName(firstFile || null);
  };

  const handleDeleteSite = (localId: string) => {
    S.deleteSite(localId);
    if (localId === selectedSiteLocalId) {
      setSelectedSiteLocalId(null);
      setOpenFileName(null);
    }
  };

  const selectedSite = selectedSiteLocalId && S.byLocalId(selectedSiteLocalId);
  const openFile = openFileName && selectedSite ? selectedSite.files[openFileName] : null;

  return (
    <div class="fixed h-full w-full bg-gray-700 flex">
      <div class="w-44 bg-gray-500 flex flex-col">
        {/* SITES #################################################################### */}
        <div class="flex flex-col">
          <div class="text-white text-center text-lg my-2">Sites</div>
          <SitesList
            sites={S.sites}
            selectedSiteLocalId={selectedSiteLocalId}
            onSelect={handleSelectSite}
            onAdd={() => S.addSite()}
            onDelete={(localId) => handleDeleteSite(localId)}
            onLocalNameChangeAttempt={S.setLocalName}
            onNameChange={S.setName}
          />
        </div>

        {/* FILES #################################################################### */}
        <div class="flex flex-col flex-grow">
          <div class="text-white text-center text-lg my-2">Files</div>
          {selectedSite &&
            Object.values(selectedSite.files).map(({ name }) => (
              <button
                class={cx('block px-2 py-1 border-b border-b-black/20 bg-gray-200', {
                  'bg-gray-300 border-r-8 border-solid border-r-emerald-500': name === openFileName,
                })}
                onClick={() => handleFileClick(name)}
              >
                {name}
              </button>
            ))}

          {selectedSite && Object.keys(selectedSite.files).length === 0 ? (
            <div class="flex items-center justify-center">
              <button
                class="bg-emerald-500 px-2 py-1 text-white rounded-md uppercase tracking-wider"
                onClick={() => S.applyTemplate(selectedSite.localId, template)}
              >
                Use template
              </button>
            </div>
          ) : null}
        </div>

        {/* BOTOM BUTTONS #################################################################### */}
        <button class="bg-red-500 text-white py-1 uppercase" onClick={onExit}>
          Exit
        </button>
      </div>

      {/* CODE EDITOR #################################################################### */}
      {openFile ? (
        <textarea
          class="flex-grow p-4 bg-gray-700 text-white font-mono"
          value={openFile.content}
          onChange={({ currentTarget }) => onEditorContentChanges(currentTarget.value)}
        ></textarea>
      ) : (
        <div class="flex flex-grow items-center justify-center text-2xl text-gray-200 opacity-50">
          {selectedSiteLocalId ? 'No file open' : 'No site selected'}
        </div>
      )}

      {/* FLOATING PREVIEW #################################################################### */}
      {selectedSite ? (
        <FloatingPreview
          files={selectedSite.files}
          title={`${selectedSite.localName}.aweb.club`}
          width={iframeWidth}
          ratio={iframeRatio}
        />
      ) : null}
    </div>
  );
};

function SitesList({
  sites,
  selectedSiteLocalId,
  onLocalNameChangeAttempt,
  onNameChange,
  onSelect,
  onDelete,
  onAdd,
}: {
  sites: Site[];
  selectedSiteLocalId: string | null;
  onLocalNameChangeAttempt: (localId: string, newName: string) => Promise<boolean>;
  onNameChange: (localId: string, newName: string) => void;
  onSelect: (localId: string) => void;
  onDelete: (localId: string) => void;
  onAdd: () => void;
}) {
  return (
    <>
      {sites.map((site) => (
        <SiteButton
          site={site}
          isSelected={selectedSiteLocalId === site.localId}
          onNameChange={(newVal) => onNameChange(site.localId, newVal)}
          onLocalNameChangeAttempt={(newVal) => onLocalNameChangeAttempt(site.localId, newVal)}
          onDelete={() => onDelete(site.localId)}
          onOpen={() => onSelect(site.localId)}
        />
      ))}
      <button class="flex items-center justify-center group mt-2 mb-4" onClick={onAdd}>
        <span class="block flex items-center justify-center text-white bg-emerald-500 group-hover:bg-emerald-400 w-8 h-8 text-xs rounded-full">
          <PlusIcon />
        </span>
      </button>
    </>
  );
}

function SiteButton({
  site,
  isSelected,
  onLocalNameChangeAttempt,
  onNameChange,
  onDelete,
  onOpen,
}: {
  site: { name: string; localName: string };
  isSelected: boolean;
  onLocalNameChangeAttempt: (val: string) => Promise<boolean>;
  onNameChange: (val: string) => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const [mode, setMode] = useState<'view' | 'editName' | 'editLocalName'>('view');
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [newValue, setNewValue] = useState<string>('');
  const elRef = useRef<HTMLDivElement>(null);

  function handleOpenMenu() {
    setMenuIsOpen(true);
  }

  function onStartEditName() {
    setNewValue(site.name);
    setMode('editName');
  }

  function onStartEditLocalName() {
    setNewValue(site.localName);
    setMode('editLocalName');
  }

  async function handleApplyNameChange() {
    if (mode === 'editName') {
      onNameChange(newValue);
      setMode('view');
      setNewValue('');
    } else if (mode === 'editLocalName') {
      if (await onLocalNameChangeAttempt(newValue)) {
        console.log('Name change successful!');
        setMode('view');
        setNewValue('');
      } else {
        console.log('Name not available');
      }
    }
  }

  return (
    <div
      class={cx('relative flex border-b border-b-black/20 h-12', {
        'bg-gray-200': !isSelected,
        'bg-gray-300': isSelected,
      })}
      ref={elRef}
    >
      {mode === 'editName' || mode === 'editLocalName' ? (
        <input
          class="block flex-grow px-2 py-1 bg-white min-w-0"
          type="text"
          value={newValue}
          onKeyUp={({ key }) => key === 'Enter' && handleApplyNameChange()}
          onChange={({ currentTarget }) => setNewValue(currentTarget.value)}
          ref={(el) => el?.focus()}
        />
      ) : (
        <button
          onClick={() => !isSelected && onOpen()}
          class={cx('flex-grow block px-2 py-1 text-left hover:bg-gray-400')}
        >
          <span class="block" onDblClick={onStartEditName}>
            {site.name}
          </span>
          <span class="block text-xs opacity-50 -mt-1" onDblClick={onStartEditLocalName}>
            {site.localName}
          </span>
        </button>
      )}
      {mode === 'view' ? (
        <button
          class="flex items-center px-1 hover:bg-gray-400 text-gray-400 hover:text-white"
          onClick={handleOpenMenu}
        >
          <MenuEllipsis />
        </button>
      ) : (
        <button
          class="bg-emerald-400 flex items-center px-1 hover:bg-emerald-300 text-white"
          onClick={handleApplyNameChange}
        >
          <CheckIcon />
        </button>
      )}
      {menuIsOpen ? (
        <FloatingMenu
          target={elRef.current!}
          items={{
            'Edit name': onStartEditName,
            'Edit domain name': onStartEditLocalName,
            Delete: onDelete,
          }}
          onClose={() => setMenuIsOpen(false)}
        />
      ) : null}
    </div>
  );
}

function FilesList() {}

function FloatingPreview({
  files,
  title,
  width,
  ratio,
}: {
  files: EditorFiles;
  title: string;
  width: number;
  ratio: number;
}) {
  const bucketHasIndex = !!files['index.html'];
  const iframeEncodedUrl = bucketHasIndex ? generateIframeEncodedUrl(files) : '';

  return bucketHasIndex ? (
    <div class="fixed bottom-2 right-2 bg-gray-200 rounded-t-md" style={{ width }}>
      <div class="px-2 py-1 flex text-gray-500">
        <div>Preview</div>
        <div class="flex-grow text-center">{title}</div>
        <div>100%</div>
      </div>
      <iframe
        class="bg-white"
        src={iframeEncodedUrl}
        style={{ width: '100%', height: width * ratio }}
      ></iframe>
    </div>
  ) : null;
}

export default Editor;
