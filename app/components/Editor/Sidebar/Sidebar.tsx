import Spinner from '@app/components/Spinner';
import { useEditorState } from '../lib/state';
import Layout from './Layout';
import Loading from '../Loading';

type Member = {
  id: number;
  tag: string;
};

type Site = {
  id: string;
  name: string;
  member_id: number;
  sharing_ids: number[];
};

type Domains = {
  address: string;
  public_use: boolean;
  members_ids: number[];
  configured: boolean;
};

type SitesDomains = {
  id: string;
  site_id: string;
  domain_id: string;
  subdomain: string;
};

type TextResource = {
  id: string;
  member_id: number;
  site_id: number | null;
  name: string;
  category: 'component' | 'data' | 'other' | 'page';
  encoding: string;
  meta: Record<string, any>;
};

type BinaryResource = {
  id: string;
  name: string;
  content_type: string;
  url: string;
  size: number;
};

const STATE = {
  membersWithSharedResources: {
    ezequiel: {
      id: 1,
      tag: 'ezequiel',
    },
  },
  selectedMember: 1,
  loadedMembers: [1],
  sharedResources: [],
  availableSites: [],
};

export default function Sidebar() {
  const {
    membersWithSharedResources,
    selectedSite,
    sitesFiles,
    fetchSiteFiles,
    memberSites,
    fullMember,
  } = useEditorState();

  return (
    <Layout>
      <Loading check={fullMember} />
      {fullMember && (
        <div class="text-white">
          <select class="bg-slate-400 px-1 py-2 w-full">
            <option value="ezequiel">ezequiel (you)</option>
          </select>
          <div class="bg-slate-500 b-b b-slate-600 text-white/70">
            <CategoryButton name="Components" icon="📦" onAdd={() => {}} />
            <div class="bg-slate-600 px-2 py-1">File something</div>
            <CategoryButton name="Data" icon="🗃" onAdd={() => {}} />
            <CategoryButton name="Other" icon="🎨" onAdd={() => {}} />
            <CategoryButton name="Media" icon="🖼" onAdd={() => {}} />
          </div>
          <div>
            <select
              class=" bg-slate-400 px-1 py-2 w-full"
              onChange={({ currentTarget }) => {
                fetchSiteFiles(currentTarget.value);
              }}
            >
              {memberSites &&
                memberSites.map((site) => <option value={site.id}>{site.name}</option>)}
            </select>
            <div class="bg-slate-500 b-b b-slate-600 text-white/70">
              <div class="flex p-1">
                <input
                  type="text"
                  class="flex-grow min-w-0 rounded-md mr-1 px-2 text-black/60"
                  placeholder="Subdomain"
                />
                <select class=" bg-slate-400 px-1 py-2 rounded-md text-white">
                  <option value="1">.hoja.ar</option>
                  <option value="2">.hojaweb.xyz</option>
                </select>
              </div>
              <div class="px-1">
                <button class="w-full py-1 px-2 rounded-md bg-slate-400">
                  Confirm domain change
                </button>
              </div>
              {selectedSite &&
                sitesFiles[selectedSite] &&
                sitesFiles[selectedSite].map((file) => <div>{file.name}</div>)}
              <CategoryButton name="People" icon="👤" onAdd={() => {}} />
              <CategoryButton name="Pages" icon="📜" onAdd={() => {}} />
              <CategoryButton name="Components" icon="📦" onAdd={() => {}} />
              <CategoryButton name="Data" icon="🗃" onAdd={() => {}} />
              <CategoryButton name="Other" icon="🎨" onAdd={() => {}} />
              <CategoryButton name="Media" icon="🖼" onAdd={() => {}} />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function ResourceButton(p: { name: string }) {}

function CategoryButton(p: { name: string; icon: string; onAdd: () => void }) {
  return (
    <div class="uppercase tracking-wider text-sm flex p1">
      <span class="mx1 flexcc">{p.icon}</span>
      <span class="flex-grow py-0.5 text-white/70">{p.name}</span>
      <button
        class="bg-white/30 text-black/50 outline-none hocus:text-white hocus:glow-lg-sm-white/40 hocus:bg-lime-500 rounded-[0.25rem] font-semibold py-1 px-2 text-xs hover:transition-none transition-background-color,box-shadow duration-500 active:scale-98"
        onClick={({ currentTarget }) => {
          currentTarget.blur();
          p.onAdd();
        }}
      >
        ADD
      </button>
    </div>
  );
}

// {
//   /* <SidebarSites
//   sites={S.sitesListSortedByLastUpdatedFile}
//   selectedSiteId={site?.id || null}
//   onSelect={handleSelectSite}
//   onAdd={() => S.addSite()}
//   onDelete={(id) => handleDeleteSite(id)}
//   onLocalNameChangeAttempt={S.setSiteLocalName}
//   onNameChange={S.setSiteName}
//   syncStatus={{}}
// />

// {site && S.selectedSiteFiles ? (
//   <SidebarFiles
//     files={S.selectedSiteFiles}
//     selectedFileId={S.selectedFile?.id || null}
//     unsavedFilesIds={Object.keys(S.UnsavedFiles.byId)}
//     onOpenFile={handleFileClick}
//     onAddFile={handleAddFile}
//     onRenameFile={handleRenameFile}
//     onApplyTemplate={(template) => S.applyTemplate(site.id, template)}
//     onDeleteFile={handleDeleteFile}
//   /> */
// }
