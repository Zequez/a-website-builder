import { cx } from '@app/lib/utils';
import useSites from './lib/useSites';
import SyncStatusIcon from './SyncStatusIcon';

export default function Inspector({ S }: { S: ReturnType<typeof useSites> }) {
  const localSites = S.sites;
  const remoteSites = S.remoteSites || [];

  return (
    <div class="absolute top-0 right-0 w-80 bg-white text-black p-2 text-sm">
      <div class="text-lg text-center">{S.isSyncing ? 'SYNCING IN PROGRESS' : 'NOT SYNCING'}</div>
      <table>
        {Object.entries(S.sitesSyncStatus).map(([id, status]) => {
          const localSite = localSites && localSites.find((s) => s.id === id);
          const remoteSite = remoteSites && remoteSites.find((s) => s.id === id);
          return (
            <tr class="">
              <td class="text-right">{localSite?.name}</td>
              <td>
                <span class="px-2">
                  <SyncStatusIcon status={status} />
                </span>
              </td>
              <td class="text-left">{remoteSite?.name}</td>
            </tr>
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
