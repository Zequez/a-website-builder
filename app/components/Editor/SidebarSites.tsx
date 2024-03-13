import { useState, useRef } from 'preact/hooks';
import cx from 'classnames';

import { Site } from './types';
import CheckIcon from '~icons/fa/check';
import PlusIcon from '~icons/fa/plus';
import MenuEllipsis from '~icons/fa/ellipsis-v';
import CloudIcon from '~icons/fa/cloud';

import FloatingMenu from '../FloatingMenu';

export default function SidebarSites({
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
  site: { name: string; localName: string; id: string | null };
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
        <>
          <button
            onClick={() => !isSelected && onOpen()}
            class={cx('flex px-2 py-1 text-left hover:bg-gray-400 flex-grow overflow-hidden')}
          >
            <div class="flex-grow overflow-hidden">
              <span
                class="block whitespace-nowrap overflow-hidden text-ellipsis"
                onDblClick={onStartEditName}
              >
                {site.name}
              </span>
              <span
                class="block text-xs opacity-50 -mt-1 whitespace-nowrap"
                onDblClick={onStartEditLocalName}
              >
                {site.localName}
              </span>
            </div>
            {site.id ? (
              <div class="h-full flex justify-center text-blue-500/70" title="Site is online">
                <CloudIcon class="w-4 -mt-1 -mr-1" />
              </div>
            ) : null}
          </button>
        </>
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
