import useSites from './lib/useSites';
import SyncStatusIcon from './SyncStatusIcon';
import { LocalFile } from './types';
import { SyncStatus } from './lib/sync';

export default function Inspector({ S }: { S: ReturnType<typeof useSites> }) {
  const localSites = S.sitesList;
  const remoteSites = S.RSites.list;
  return null;

  // function filesStatusFor(localFiles: LocalFile[], remoteFiles: LocalFile[] | null) {
  //   const resolved: { [key: string]: SyncStatus } = {};

  //   localFiles.forEach((file) => {
  //     resolved[file.id] = S.filesSyncStatus[file.id];
  //   });
  //   remoteFiles?.forEach((file) => {
  //     resolved[file.id] = S.filesSyncStatus[file.id];
  //   });

  //   return resolved;
  // }

  // const allLocalSitesIds = localSites.map((s) => s.id);
  // const orphanFiles = S.filesList.filter((f) => !allLocalSitesIds.includes(f.siteId));

  // return (
  //   <div class="fixed z-100 border-1 shadow-md border-black top-0 right-0 bg-white text-black p-2 text-xs whitespace-nowrap overflow-auto">
  //     <div class="text-lg text-center">
  //       {S.isSyncingSites ? 'SITES SYNCING IN PROGRESS' : 'NOT SYNCING SITES'}
  //     </div>
  //     <div class="text-lg text-center">
  //       {S.isSyncingFiles ? 'FILES SYNCING IN PROGRESS' : 'NOT SYNCING FILES'}
  //     </div>
  //     <table class="inline-block">
  //       {Object.entries(S.sitesSyncStatus).map(([id, status]) => {
  //         const localSite = localSites && localSites.find((s) => s.id === id);
  //         const remoteSite = remoteSites && remoteSites.find((s) => s.id === id);

  //         const localFiles = S.filesList.filter((f) => f.siteId === id);
  //         const remoteFiles = S.RFiles.list ? S.RFiles.list.filter((f) => f.siteId === id) : [];
  //         const filesStatus = filesStatusFor(localFiles, remoteFiles);
  //         return (
  //           <>
  //             <tr class="">
  //               <td class="text-left">
  //                 <div class="max-w-30 text-ellipsis overflow-hidden" title={localSite?.name || ''}>
  //                   {localSite?.name}
  //                 </div>
  //               </td>
  //               <td class="text-center">
  //                 <span class="px-2">
  //                   <SyncStatusIcon status={status} />
  //                 </span>
  //               </td>
  //               <td class="text-right" title={remoteSite?.name || ''}>
  //                 <div class="max-w-30 text-ellipsis overflow-hidden">{remoteSite?.name}</div>
  //               </td>
  //             </tr>
  //             <tr>
  //               <td colspan={3}>
  //                 <div class="ml-2 pl-2 border-l border-solid border-black/60">
  //                   <FilesTable
  //                     filesStatus={filesStatus}
  //                     localFilesById={S.filesById}
  //                     remoteFilesById={S.RFiles._byId}
  //                   />
  //                 </div>
  //               </td>
  //             </tr>
  //           </>
  //         );
  //       })}
  //     </table>
  //     {orphanFiles.length ? (
  //       <>
  //         <div class="text-lg">Orphan Files</div>
  //         <OrphanFilesTable files={orphanFiles} filesStatus={S.filesSyncStatus} />
  //       </>
  //     ) : null}
  //     <div class="text-red-500">
  //       {S.sitesSyncingError.map((err) => (
  //         <div>{err}</div>
  //       ))}
  //       {S.filesSyncingError.map((err) => (
  //         <div>{err}</div>
  //       ))}
  //     </div>
  //   </div>
  // );
}

function FilesTable({
  filesStatus,
  localFilesById,
  remoteFilesById,
}: {
  filesStatus: { [key: string]: SyncStatus };
  localFilesById: { [key: string]: LocalFile };
  remoteFilesById: { [key: string]: LocalFile } | null;
}) {
  return (
    <table class="w-full text-xs">
      {Object.entries(filesStatus).map(([fileId, status]) => (
        <tr>
          <td class="text-left">
            <div
              class="max-w-24 text-ellipsis overflow-hidden"
              title={localFilesById[fileId]?.name}
            >
              {localFilesById[fileId]?.name}
            </div>
          </td>
          <td class="w-full text-center">
            <span class="px-2 text-xs">
              <SyncStatusIcon status={status} />
            </span>
          </td>
          <td class="text-right">
            <div
              class="max-w-24 text-ellipsis overflow-hidden"
              title={(remoteFilesById && remoteFilesById[fileId]?.name) || ''}
            >
              {remoteFilesById && remoteFilesById[fileId]?.name}
            </div>
          </td>
        </tr>
      ))}
    </table>
  );
}

function OrphanFilesTable({
  files,
  filesStatus,
}: {
  files: LocalFile[];
  filesStatus: { [key: string]: SyncStatus };
}) {
  return (
    <table class="w-full text-xs">
      {files.map((file) => (
        <tr>
          <td class="text-left">{file.name}</td>
          <td class="w-full text-center">
            <span class="px-2 text-xs">
              <SyncStatusIcon status={filesStatus[file.id]} />
            </span>
          </td>
        </tr>
      ))}
    </table>
  );
}
