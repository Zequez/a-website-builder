import { FileB64 } from '@db';
import { LocalFile } from '../types';

export function remoteFileToLocalFile(fileB64: FileB64): LocalFile {
  return {
    id: fileB64.id,
    name: fileB64.name,
    content: atob(fileB64.data),
    updatedAt: new Date(fileB64.updated_at),
  };
}
