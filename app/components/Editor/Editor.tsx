import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

import CloudIcon from '~icons/fa6-solid/cloud';
import OutLink from '~icons/fa6-solid/up-right-from-square';
import HGripLinesIcon from '~icons/fa6-solid/grip-lines';
import VGripLinesIcon from '~icons/fa6-solid/grip-lines-vertical';

import { appUrl, cx, useLocalStorageState } from '@app/lib/utils';
import { LocalSite } from './types';

import { useAuth } from '../Auth';
import useSites from './lib/useSites';

import SidebarSites from './SidebarSites';
import SidebarFiles from './SidebarFiles';
import Preview from './Preview';
import CodePanel from './CodePanel';
import { build } from './lib/builder';
import Inspector from './Inspector';

const Editor = () => {
  const { memberAuth } = useAuth();
  const S = useSites(memberAuth);
  const site = S.selectedSite;
  const [openFileName, setOpenFileName] = useState<string | null>(null);
  const [editorInspector, setEditorInspector] = useLocalStorageState('editor_inspector', false);
  const [syncEnabled, setSyncEnabled] = useState(false);

  useEffect(() => {
    function toggleEditorInspector(ev: KeyboardEvent) {
      console.log('Toggling editor inspector', ev);
      if (ev.key === 'i' && ev.metaKey) {
        setEditorInspector((state) => !state);
      }
    }
    window.addEventListener('keydown', toggleEditorInspector);
    return () => {
      window.removeEventListener('keydown', toggleEditorInspector);
    };
  }, []);

  useEffect(() => {
    if (syncEnabled) {
      S.sync();
    }
  }, [syncEnabled, S.sites, S.remoteSites, S.sitesSyncStatus]);

  const handleFileClick = (fileName: string) => {
    setOpenFileName(fileName);
  };

  const onEditorContentChanges = (content: string) => {
    if (site && openFileName) {
      S.writeFile(site.id, openFileName, content);
    }
  };

  const handleSelectSite = (localId: string) => {
    S.setSelected(localId);
    const newSelectedSite = S.byLocalId(localId);
    const firstFile = Object.keys(newSelectedSite.files)[0];
    setOpenFileName(firstFile || null);
  };

  const handleDeleteSite = (localId: string) => {
    S.deleteSite(localId);
    if (site && localId === site.localId) {
      S.setSelected(null);
      setOpenFileName(null);
    }
  };

  const handleAddFile = (newFileName: string) => {
    if (site) {
      S.createFile(site.id, newFileName, '');
      setOpenFileName(newFileName);
    }
  };

  const handleRenameFile = (fileName: string, newFileName: string) => {
    if (site) {
      S.renameFile(site.id, fileName, newFileName);
    }
  };

  const handleAttemptSyncEnabling = () => {
    if (memberAuth) {
      setSyncEnabled(!syncEnabled);
    } else {
      alert('You must register to enable syncing');
    }
  };

  const openFile = openFileName && site ? site.files[openFileName] : null;

  return (
    <div class="fixed h-full w-full bg-gray-700 flex z-20">
      {editorInspector ? <Inspector S={S} /> : null}
      <div class="w-54 bg-gray-500 flex flex-col overflow-auto">
        <SidebarSites
          sites={S.sites}
          selectedSiteId={site?.localId || null}
          onSelect={handleSelectSite}
          onAdd={() => S.addSite()}
          onDelete={(id) => handleDeleteSite(id)}
          onLocalNameChangeAttempt={S.setLocalName}
          onNameChange={S.setName}
          syncStatus={S.sitesSyncStatus}
        />

        {site ? (
          <SidebarFiles
            files={site.files}
            openedFileName={openFileName}
            onOpenFile={handleFileClick}
            onAddFile={handleAddFile}
            onRenameFile={handleRenameFile}
            onApplyTemplate={(template) => S.applyTemplate(site.id, template)}
            onDeleteFile={(fileName) => S.deleteFile(site.id, fileName)}
          />
        ) : (
          <div class="flex-grow"></div>
        )}

        <BottomButtons
          selectedSite={site}
          syncEnabled={syncEnabled}
          onToggleSync={handleAttemptSyncEnabling}
        />
      </div>

      <div class="flex flex-grow flex-col">
        <CodePanel site={site} file={openFile} onChange={onEditorContentChanges} />
        <div class="h-2 bg-gray-500 hover:cursor-ns-resize text-white/80 flex justify-center">
          <HGripLinesIcon class="h-3 -mt-0.5" />
        </div>
        <div class="flex-shrink-0 h-1/2">
          {site ? (
            <Preview
              site={site}
              currentFileName={openFileName || null}
              onSwitchPosition={() => null}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

const bottomButtonStyle = (c: string) =>
  cx('block  py-1 uppercase text-left tracking-wider px-2', c);

function BottomButtons({
  selectedSite,
  syncEnabled,
  onToggleSync,
}: {
  selectedSite: LocalSite | null;
  syncEnabled: boolean;
  onToggleSync: () => void;
}) {
  const currentHost = window.location.host;
  const currentProtocol = window.location.protocol;
  const siteUrl = selectedSite
    ? `${currentProtocol}//${selectedSite.localName}.${currentHost}`
    : null;

  return (
    <>
      <button
        class={bottomButtonStyle(
          syncEnabled ? 'bg-lime-600 text-white/60' : 'bg-gray-400 text-white',
        )}
        onClick={onToggleSync}
      >
        <div class="flex w-full">
          <div class="flex-grow text-left">{syncEnabled ? 'Syncing' : 'SYNC'}</div>
          <div>{syncEnabled ? '🟢' : '⚪️'}</div>
        </div>
      </button>
      {/* <a class={bottomButtonStyle('bg-lime-600')} href={siteUrl!} target="_blank">
        Live site <OutLink class="inline-block ml-1 -mt-1" />
      </a> */}
      <a class={bottomButtonStyle('bg-blue-300 text-black/60')} href={appUrl('/')}>
        &larr; Back home
      </a>
    </>
  );
}

export default Editor;
