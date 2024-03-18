export type SyncStatus =
  | 'local-only'
  | 'local-latest'
  | 'remote-only'
  | 'remote-latest'
  | 'unknown'
  | 'synced';
export type SyncableObject = { id: string; updatedAt: Date };
export function resolveSyncStatus(local: SyncableObject[], remote: SyncableObject[] | null) {
  const status: { [key: string]: SyncStatus } = {};
  local.forEach((obj) => {
    status[obj.id] = remote ? 'local-only' : 'unknown';
  });
  if (remote) {
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
  }
  return status;
}

export function resolveSync(
  local: SyncableObject | null,
  remote: SyncableObject | null | undefined,
) {
  if (remote === undefined) return 'unknown';
  if (!local) return 'remote-only';
  if (!remote) return 'local-only';
  if (local.updatedAt > remote.updatedAt) return 'local-latest';
  if (local.updatedAt < remote.updatedAt) return 'remote-latest';
  return 'synced';
}
