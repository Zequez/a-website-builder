import { SyncStatus } from './lib/sync';

export default function SyncStatusIcon({ status }: { status: SyncStatus }) {
  switch (status) {
    case 'local-only':
      return <span>🟢⚪️</span>;
    case 'remote-only':
      return <span>⚪️🟢</span>;
    case 'local-latest':
      return <span>🟢🟡</span>;
    case 'remote-latest':
      return <span>🟡🟢</span>;
    case 'synced':
      return <span>🟢🟢</span>;
    case 'unknown':
      return <span>❓</span>;
    default:
      return null;
  }
}
