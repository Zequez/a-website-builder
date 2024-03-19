import useSites from './lib/useSites';
import SyncStatusIcon from './SyncStatusIcon';
import { LocalFile } from './types';
import { SyncStatus } from './lib/sync';

export default function Inspector({ S }: { S: ReturnType<typeof useSites> }) {
  const localSites = S.sitesList;
  const remoteSites = S.RSites.list;

  function filesStatusFor(localFiles: LocalFile[], remoteFiles: LocalFile[] | null) {
    const resolved: { [key: string]: SyncStatus } = {};

    localFiles.forEach((file) => {
      resolved[file.id] = S.filesSyncStatus[file.id];
    });
    remoteFiles?.forEach((file) => {
      resolved[file.id] = S.filesSyncStatus[file.id];
    });

    return resolved;
  }

  return (
    <div class="fixed z-100 border-1 shadow-md border-black top-0 right-0 w-80 bg-white text-black p-2 text-sm">
      <div class="text-lg text-center">
        {S.isSyncingSites ? 'SITES SYNCING IN PROGRESS' : 'NOT SYNCING SITES'}
      </div>
      <div class="text-lg text-center">
        {S.isSyncingFiles ? 'FILES SYNCING IN PROGRESS' : 'NOT SYNCING FILES'}
      </div>
      <table>
        {Object.entries(S.sitesSyncStatus).map(([id, status]) => {
          const localSite = localSites && localSites.find((s) => s.id === id);
          const remoteSite = remoteSites && remoteSites.find((s) => s.id === id);
          S.filesSyncStatus;

          const localFiles = S.filesList.filter((f) => f.siteId === id);
          const remoteFiles = S.RFiles.list ? S.RFiles.list.filter((f) => f.siteId === id) : [];
          const filesStatus = filesStatusFor(localFiles, remoteFiles);
          return (
            <>
              <tr class="">
                <td class="text-left">{localSite?.name}</td>
                <td class="w-full text-center">
                  <span class="px-2">
                    <SyncStatusIcon status={status} />
                  </span>
                </td>
                <td class="text-right">{remoteSite?.name}</td>
              </tr>
              <tr>
                <td colspan={3}>
                  <div class="ml-2 pl-2 border-l border-solid border-black/60">
                    <table class="w-full text-xs">
                      {Object.entries(filesStatus).map(([fileId, status]) => (
                        <tr>
                          <td class="text-left">{S.filesById[fileId]?.name}</td>
                          <td class="w-full text-center">
                            <span class="px-2 text-xs">
                              <SyncStatusIcon status={status} />
                            </span>
                          </td>
                          <td class="text-right">
                            {S.RFiles._byId && S.RFiles._byId[fileId]?.name}
                          </td>
                        </tr>
                      ))}
                      <tr></tr>
                    </table>
                  </div>
                </td>
              </tr>
            </>
          );
        })}
      </table>
      <div class="text-red-500">
        {S.sitesSyncingError.map((err) => (
          <div>{err}</div>
        ))}
        {S.filesSyncingError.map((err) => (
          <div>{err}</div>
        ))}
      </div>
    </div>
  );
}
