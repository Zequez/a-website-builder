import { apiFetchWrapper, API_BASE_URL } from '@app/lib/apiHelpers';
import {
  StorageListResponse,
  StorageListQuery,
  ListQuery,
  ListResponse,
  OnUploadCompleteResponse,
  OnUploadCompleteQuery,
} from './blobs';

export const storageList = apiFetchWrapper<StorageListQuery, StorageListResponse>(
  'GET',
  'blobs/storage/list',
);

export const storageDelete = apiFetchWrapper<{ url: string }, {}>('DELETE', 'blobs/storage/delete');

export const list = apiFetchWrapper<ListQuery, ListResponse>('GET', 'blobs/list');

export const onUploadComplete = apiFetchWrapper<OnUploadCompleteQuery, OnUploadCompleteResponse>(
  'POST',
  'blobs/onUploadComplete',
);

export const uploadUrl = API_BASE_URL + 'blobs/upload';
