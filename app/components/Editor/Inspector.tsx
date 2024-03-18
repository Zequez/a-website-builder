import { cx } from '@app/lib/utils';
import useSites from './lib/useSites';
import SyncStatusIcon from './SyncStatusIcon';
import { LocalSite } from './types';
import { SyncStatus } from './lib/sync';
// import {resolveSync} from './lib/sync';

export default function Inspector({ S }: { S: ReturnType<typeof useSites> }) {
  const localSites = S.sites;
  const remoteSites = S.remoteSites || [];

  function filesStatusFor(localSite?: LocalSite, remoteSite?: LocalSite) {
    const resolved: { [key: string]: SyncStatus } = {};
    const localFiles = localSite?.files ? Object.values(localSite.files) : null;
    const remoteFiles = remoteSite?.files ? Object.values(remoteSite.files) : null;
    for (let fileId in S.filesSyncStatus) {
      if (localFiles?.find((f) => f.id === fileId) || remoteFiles?.find((f) => f.id === fileId)) {
        resolved[fileId] = S.filesSyncStatus[fileId];
      }
    }
    return resolved;
  }

  return (
    <div class="absolute top-0 right-0 w-80 bg-white text-black p-2 text-sm">
      <div class="text-lg text-center">{S.isSyncing ? 'SYNCING IN PROGRESS' : 'NOT SYNCING'}</div>
      <table>
        {Object.entries(S.sitesSyncStatus).map(([id, status]) => {
          const localSite = localSites && localSites.find((s) => s.id === id);
          const remoteSite = remoteSites && remoteSites.find((s) => s.id === id);
          const filesStatus = filesStatusFor(localSite, remoteSite);
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
                          <td class="text-left">{S.localFiles[fileId]?.name}</td>
                          <td class="w-full text-center">
                            <span class="px-2 text-xs">
                              <SyncStatusIcon status={status} />
                            </span>
                          </td>
                          <td class="text-right">{S.remoteFiles[fileId]?.name}</td>
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
        {S.syncError.map((err) => (
          <div>{err}</div>
        ))}
      </div>
    </div>
  );
}
