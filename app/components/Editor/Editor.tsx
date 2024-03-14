import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

import CloudIcon from '~icons/fa/cloud';
import OutLink from '~icons/fa/external-link';

import { cx } from '@app/lib/utils';
import { Site } from './types';

import { useAuth } from '../Auth';
import useSites from './lib/useSites';

import SidebarSites from './SidebarSites';
import SidebarFiles from './SidebarFiles';
import Preview from './Preview';
import CodePanel from './CodePanel';

const Editor = () => {
  const { memberAuth } = useAuth();
  const S = useSites(memberAuth);
  const site = S.selectedSite;
  const [openFileName, setOpenFileName] = useState<string | null>(null);

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
    if (site && openFileName) {
      S.writeFile(site.localId, openFileName, content);
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
      S.createFile(site.localId, newFileName, '');
    }
  };

  const handleRenameFile = (fileName: string, newFileName: string) => {
    if (site) {
      S.renameFile(site.localId, fileName, newFileName);
    }
  };

  const openFile = openFileName && site ? site.files[openFileName] : null;

  return (
    <div class="fixed h-full w-full bg-gray-700 flex z-20">
      <div class="w-44 bg-gray-500 flex flex-col">
        <SidebarSites
          sites={S.sites}
          selectedSiteLocalId={site?.localId || null}
          onSelect={handleSelectSite}
          onAdd={() => S.addSite()}
          onDelete={(localId) => handleDeleteSite(localId)}
          onLocalNameChangeAttempt={S.setLocalName}
          onNameChange={S.setName}
        />

        {site ? (
          <SidebarFiles
            files={site.files}
            openedFileName={openFileName}
            onOpenFile={handleFileClick}
            onAddFile={handleAddFile}
            onRenameFile={handleRenameFile}
            onApplyTemplate={(template) => S.applyTemplate(site.localId, template)}
            onDeleteFile={(fileName) => S.deleteFile(site.localId, fileName)}
          />
        ) : (
          <div class="flex-grow"></div>
        )}

        <BottomButtons selectedSite={site} onPublish={() => S.publishSite(site!.localId!)} />
      </div>

      <div class="flex flex-grow flex-col">
        <CodePanel site={site} file={openFile} onChange={onEditorContentChanges} />
        <div class="h-2 bg-white/20 hover:cursor-ns-resize"></div>
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
  cx('block text-white py-1 uppercase text-center tracking-wider', c);

function BottomButtons({
  selectedSite,
  onPublish,
}: {
  selectedSite: Site | null;
  onPublish: () => void;
}) {
  const currentHost = window.location.host;
  const currentProtocol = window.location.protocol;
  const siteUrl = selectedSite
    ? `${currentProtocol}//${selectedSite.localName}.${currentHost}`
    : null;

  return (
    <>
      {selectedSite ? (
        !selectedSite.id ? (
          <button class={bottomButtonStyle('bg-orange-400')} onClick={onPublish}>
            Publish <CloudIcon class="inline-block -mt-1" />
          </button>
        ) : (
          <a class={bottomButtonStyle('bg-lime-600')} href={siteUrl!} target="_blank">
            Live site <OutLink class="inline-block ml-1 -mt-1" />
          </a>
        )
      ) : null}
      <a class={bottomButtonStyle('bg-red-500')} href="/">
        Exit
      </a>
    </>
  );
}

export default Editor;
