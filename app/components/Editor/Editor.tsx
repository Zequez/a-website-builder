import { useEffect } from 'preact/hooks';

import OutLink from '~icons/fa6-solid/up-right-from-square';
import HGripLinesIcon from '~icons/fa6-solid/grip-lines';

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
  const file = S.selectedFile;
  const [editorInspector, setEditorInspector] = useLocalStorageState('editor_inspector', false);

  useEffect(() => {
    function toggleEditorInspector(ev: KeyboardEvent) {
      if (ev.key === 'i' && ev.metaKey) {
        setEditorInspector((state) => !state);
      }
    }
    window.addEventListener('keydown', toggleEditorInspector);
    return () => {
      window.removeEventListener('keydown', toggleEditorInspector);
    };
  }, []);

  const handleFileClick = (id: string) => {
    S.selectFile(id);
  };

  const onEditorContentChanges = (content: string) => {
    if (file) {
      S.writeFile({ ...file, content });
    }
  };

  const handleSelectSite = (id: string) => {
    S.selectSite(id);
  };

  const handleDeleteSite = (id: string) => {
    S.deleteSite(id);
  };

  const handleAddFile = (name: string) => {
    if (site) {
      const { id } = S.createFile(site.id, { name, content: '' });
      S.selectFile(id);
    }
  };

  const handleRenameFile = (id: string, name: string) => {
    S.renameFile({ id, name });
  };

  const handleAttemptSyncEnabling = () => {
    if (memberAuth) {
      S.setSyncEnabled((v) => !v);
    } else {
      alert('You must register to enable syncing');
    }
  };

  // const openFile = openFileName && site ? site.files[openFileName] : null;

  const openFile = S.selectedFile;

  return (
    <div class="fixed h-full w-full bg-gray-700 flex z-20">
      {editorInspector ? <Inspector S={S} /> : null}
      <div class="w-54 bg-gray-500 flex flex-col overflow-auto">
        <SidebarSites
          sites={S.sitesList}
          selectedSiteId={site?.id || null}
          onSelect={handleSelectSite}
          onAdd={() => S.addSite()}
          onDelete={(id) => handleDeleteSite(id)}
          onLocalNameChangeAttempt={S.setSiteLocalName}
          onNameChange={S.setSiteName}
          syncStatus={S.sitesSyncStatus}
        />

        {site && S.selectedSiteFiles ? (
          <SidebarFiles
            files={S.selectedSiteFiles}
            selectedFileId={S.selectedFile?.id || null}
            onOpenFile={handleFileClick}
            onAddFile={handleAddFile}
            onRenameFile={handleRenameFile}
            onApplyTemplate={(template) => S.applyTemplate(site.id, template)}
            onDeleteFile={(fileId) => S.deleteFile(fileId)}
          />
        ) : (
          <div class="flex-grow"></div>
        )}

        <BottomButtons
          selectedSite={site}
          syncEnabled={S.syncEnabled}
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
              siteFiles={S.selectedSiteFiles!}
              currentFileId={S.selectedFileId}
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
