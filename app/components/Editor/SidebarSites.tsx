import { useState, useRef } from 'preact/hooks';
import cx from 'classnames';

import { LocalSite } from './types';
import CheckIcon from '~icons/fa6-solid/check';
import PlusIcon from '~icons/fa6-solid/plus';
import MenuEllipsis from '~icons/fa6-solid/ellipsis-vertical';
// import CloudIcon from '~icons/fa6-solid/cloud';

import SyncStatusIcon from './SyncStatusIcon';

import FloatingMenu from '../FloatingMenu';
import { SyncStatus } from './lib/sync';

export default function SidebarSites({
  sites,
  selectedSiteId,
  onLocalNameChangeAttempt,
  onNameChange,
  onSelect,
  onDelete,
  onAdd,
  syncStatus,
}: {
  sites: LocalSite[];
  selectedSiteId: string | null;
  onLocalNameChangeAttempt: (localId: string, newName: string) => Promise<boolean>;
  onNameChange: (localId: string, newName: string) => void;
  onSelect: (localId: string) => void;
  onDelete: (localId: string) => void;
  onAdd: () => void;
  syncStatus: { [key: string]: SyncStatus };
}) {
  return (
    <div class="flex flex-col">
      <div class="text-white text-center text-lg my-2">Sites</div>
      {sites
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((site) =>
          site.deleted ? null : (
            <SiteButton
              site={site}
              isSelected={selectedSiteId === site.id}
              onNameChange={(newVal) => onNameChange(site.id, newVal)}
              onLocalNameChangeAttempt={(newVal) => onLocalNameChangeAttempt(site.id, newVal)}
              onDelete={() => onDelete(site.id)}
              onOpen={() => onSelect(site.id)}
              syncStatus={syncStatus[site.id]}
            />
          ),
        )}
      <button class="flex items-center justify-center group mt-2 mb-4" onClick={onAdd}>
        <span class="block flex items-center justify-center text-white bg-emerald-500 group-hover:bg-emerald-400 w-8 h-8 text-xs rounded-full">
          <PlusIcon />
        </span>
      </button>
    </div>
  );
}

function SiteButton({
  site,
  isSelected,
  onLocalNameChangeAttempt,
  onNameChange,
  onDelete,
  onOpen,
  syncStatus,
}: {
  site: { name: string; localName: string; id: string | null };
  isSelected: boolean;
  onLocalNameChangeAttempt: (val: string) => Promise<boolean>;
  onNameChange: (val: string) => void;
  onDelete: () => void;
  onOpen: () => void;
  syncStatus: SyncStatus;
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
              <div
                class="h-full flex justify-center items-center whitespace-nowrap text-blue-500/70"
                style={{ fontSize: '0.5rem' }}
                title={`Sync status ${syncStatus}`}
              >
                <SyncStatusIcon status={syncStatus} />
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
