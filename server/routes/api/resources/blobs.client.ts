import { apiFetchWrapper } from '@app/lib/apiHelpers';
import { StorageListResponse, StorageListQuery, ListQuery, ListResponse } from './blobs';

export const storageList = apiFetchWrapper<StorageListQuery, StorageListResponse>(
  'GET',
  'blobs/storage/list',
);

export const storageDelete = apiFetchWrapper<{ url: string }, {}>('DELETE', 'blobs/storage/delete');

export const list = apiFetchWrapper<ListQuery, ListResponse>('GET', 'blobs/list');
