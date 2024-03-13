import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

import cx from 'classnames';

import CloudIcon from '~icons/fa/cloud';
import OutLink from '~icons/fa/external-link';

import { Site } from './types';
import { filesByName as template } from './template';
import { useAuth } from '../Auth';
import useSites from './lib/useSites';

import SidebarSites from './SidebarSites';
import Preview from './Preview';

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

  const openFile = openFileName && site ? site.files[openFileName] : null;

  return (
    <div class="fixed h-full w-full bg-gray-700 flex z-20">
      <div class="w-44 bg-gray-500 flex flex-col">
        {/* SITES #################################################################### */}
        <div class="flex flex-col">
          <div class="text-white text-center text-lg my-2">Sites</div>
          <SidebarSites
            sites={S.sites}
            selectedSiteLocalId={site?.localId || null}
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
          {site &&
            Object.values(site.files).map(({ name }) => (
              <button
                class={cx('block px-2 py-1 border-b border-b-black/20 bg-gray-200', {
                  'bg-gray-300 border-r-8 border-solid border-r-emerald-500': name === openFileName,
                })}
                onClick={() => handleFileClick(name)}
              >
                {name}
              </button>
            ))}

          {site && Object.keys(site.files).length === 0 ? (
            <div class="flex items-center justify-center">
              <button
                class="bg-emerald-500 px-2 py-1 text-white rounded-md uppercase tracking-wider"
                onClick={() => S.applyTemplate(site.localId, template)}
              >
                Use template
              </button>
            </div>
          ) : null}
        </div>

        <BottomButtons selectedSite={site} onPublish={() => S.publishSite(site!.localId!)} />
      </div>

      {/* CODE EDITOR #################################################################### */}
      {openFile ? (
        <textarea
          class={'flex-grow p-4 bg-gray-700 text-white font-mono'}
          value={openFile.content}
          onChange={({ currentTarget }) => onEditorContentChanges(currentTarget.value)}
        ></textarea>
      ) : (
        <div class="flex flex-grow items-center justify-center text-2xl text-gray-200 opacity-50">
          {site ? 'No file open' : 'No site selected'}
        </div>
      )}

      {/* FLOATING PREVIEW #################################################################### */}
      {site ? <Preview files={site.files} title={`${site.localName}.aweb.club`} /> : null}
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
