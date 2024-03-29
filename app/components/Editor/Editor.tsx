import { useEffect, useState } from 'preact/hooks';

import OutLink from '~icons/fa6-solid/up-right-from-square';
import HGripLinesIcon from '~icons/fa6-solid/grip-lines';

import { appUrl, cx, useLocalStorageState } from '@app/lib/utils';
import { LocalFile, LocalSite } from './types';

import { useAuth } from '../Auth';
import useSites from './lib/useSites';
import build, { BuildError, BuildFile } from './lib/builder';
import { btoa } from '@shared/utils';

import SidebarSites from './SidebarSites';
import SidebarFiles from './NewSidebarFiles';
import Preview from './Preview';
import CodePanel from './CodePanel';
import Inspector from './Inspector';
import { postFilesSaveBuild } from '@app/lib/api';
import { relocateFiles } from './lib/files-sections';

const Editor = () => {
  const { memberAuth } = useAuth();
  // const SS = useSitesAndFiles(memberAuth ? memberAuth.member.id : null);
  const S = useSites(memberAuth);
  const site = S.selectedSite;
  const file = S.selectedFile;
  const [editorInspector, setEditorInspector] = useLocalStorageState('editor_inspector', false);
  const [buildFiles, setBuildFiles] = useState<BuildFile[]>([]);
  const [buildErrors, setBuildErrors] = useState<BuildError[]>([]);

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

  // useEffect(() => {
  //   // Fix: Remove duplicate keys
  //   const existingFiles: { [key: string]: LocalFile } = {};
  //   if (S.selectedSiteFiles) {
  //     S.selectedSiteFiles.forEach((file) => {
  //       if (!existingFiles[file.name]) {
  //         existingFiles[file.name] = file;
  //       } else {
  //         S.deleteFile(file.id);
  //       }
  //     });
  //     // S.setSelectedSiteFiles(Object.values(existingFiles));
  //   }
  // }, [S.selectedSiteFiles]);

  useEffect(() => {
    if (!S.selectedSiteFiles || S.selectedSiteId === null) return;
    const updates = relocateFiles(S.selectedSiteFiles);
    updates.forEach((file) => {
      S.renameFile({ ...file, siteId: S.selectedSiteId! });
    });
  }, [S.selectedSiteFiles]);

  useEffect(() => {
    if (!S.selectedSiteId || !S.selectedSiteFiles) return;
    build(S.selectedSiteFiles).then((buildContext) => {
      if (buildContext.errors.length === 0) {
        setBuildFiles(buildContext.files);
      }
      setBuildErrors(buildContext.errors);
      if (buildContext.errors.length) {
        console.log('BUILD ERRORS', buildContext.errors);
      }
    });
  }, [S.selectedSiteId, S.selectedSiteFiles]);

  useEffect(() => {
    if (buildFiles.length > 0 && S.syncEnabled && site && memberAuth) {
      if (S.RSites._byId?.[site.id]) {
        console.log('Publishing build files', buildFiles);
        postFilesSaveBuild(
          {
            siteId: site.id,
            files: buildFiles.map(({ name, content }) => ({ name, data: btoa(content) })),
          },
          memberAuth.token,
        );
      }
    }
  }, [buildFiles, S.syncEnabled, site, memberAuth, S.RSites._byId]);

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
      const newFile = S.createFile(site.id, { name, content: '' });
      if (newFile) {
        S.selectFile(newFile.id);
      }
    }
  };

  const handleRenameFile = (id: string, name: string) => {
    if (S.selectedSiteId) {
      S.renameFile({ id, name, siteId: S.selectedSiteId });
    }
  };

  const handleAttemptSyncEnabling = () => {
    if (memberAuth) {
      S.setSyncEnabled((v) => !v);
    } else {
      alert('You must register to enable syncing');
    }
  };

  const openFile = S.selectedFile;

  return (
    <div class="fixed h-full w-full bg-gray-700 flex z-20">
      {editorInspector ? <Inspector S={S} /> : null}
      <div class="w-54 bg-gray-500 flex flex-col flex-shrink-0">
        <SidebarSites
          sites={S.sitesListSortedByLastUpdatedFile}
          selectedSiteId={site?.id || null}
          onSelect={handleSelectSite}
          onAdd={() => S.addSite()}
          onDelete={(id) => handleDeleteSite(id)}
          onLocalNameChangeAttempt={S.setSiteLocalName}
          onNameChange={S.setSiteName}
          syncStatus={{}}
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
          selectedSite={S.RSites._byId && site && S.RSites._byId[site.id]}
          syncEnabled={S.syncEnabled}
          onToggleSync={handleAttemptSyncEnabling}
        />
      </div>

      <div class="flex flex-grow flex-col overflow-hidden">
        <CodePanel site={site} file={openFile} onChange={onEditorContentChanges} />
        {buildErrors.length ? (
          <div class="bg-red-300 text-white p-2 leading-tight flex flex-col space-y-2 overflow-auto max-h-1/3">
            {/* <div class="text-2xl">ERRORS</div> */}
            {buildErrors.map(({ message, e, file }) => {
              return (
                <div class="bg-black/10 p-2 rounded-md">
                  {message}
                  <div>{file ? `File: ${file.name}` : null}</div>
                  {e ? <pre>{e.message ? e.message : JSON.stringify(e, null, 2)}</pre> : null}
                </div>
              );
            })}
          </div>
        ) : null}
        <div class="h-2 bg-gray-500 hover:cursor-ns-resize text-white/80 flex justify-center">
          <HGripLinesIcon class="h-3 -mt-0.5" />
        </div>
        <div class="flex-shrink-0 h-1/2">
          {site ? (
            <Preview
              site={site}
              buildFiles={buildFiles}
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
  let currentHost = window.location.host;
  const currentProtocol = window.location.protocol;
  if (currentHost.match(/localhost\:5173/)) {
    currentHost = `hoja.localhost:3000`;
  }
  const siteUrl = selectedSite
    ? `${currentProtocol}//${selectedSite.localName}.${currentHost}`
    : null;

  return (
    <>
      {selectedSite ? (
        <a class={bottomButtonStyle('bg-lime-300 text-black/40')} href={siteUrl!} target="_blank">
          <div class="flex w-full">
            <div class="flex-grow text-left">Live site</div>
            <div>
              <OutLink class="inline-block ml-1 -mt-1" />
            </div>
          </div>
        </a>
      ) : null}
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

      <a class={bottomButtonStyle('bg-blue-300 text-black/60')} href={appUrl('/')}>
        &larr; Back home
      </a>
    </>
  );
}

export default Editor;
