export type SyncStatus = 'local-only' | 'local-latest' | 'remote-only' | 'remote-latest' | 'synced';
export type SyncableObject = { id: string; updatedAt: Date };
export function resolveSyncStatus(local: SyncableObject[], remote: SyncableObject[]) {
  const status: { [key: string]: SyncStatus } = {};
  local.forEach((obj) => {
    status[obj.id] = 'local-only';
  });
  remote.forEach((obj) => {
    const localObj = local.find((x) => x.id === obj.id);
    if (!localObj) {
      status[obj.id] = 'remote-only';
    } else {
      if (obj.updatedAt > localObj.updatedAt) {
        status[obj.id] = 'remote-latest';
      } else if (obj.updatedAt < localObj.updatedAt) {
        status[obj.id] = 'local-latest';
      } else {
        status[obj.id] = 'synced';
      }
    }
  });
  return status;
}
