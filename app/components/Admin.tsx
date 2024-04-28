import { useAuth } from '@app/lib/AuthContext';
import { ApiEndpoint, useRemoteResource } from '@app/lib/apiHelpers';
import { cx } from '@app/lib/utils';
import * as blobsApi from '@server/routes/api/resources/blobs.client';
import { useEffect, useState } from 'preact/hooks';

export default function Admin() {
  const [tab, setTab] = useState<'blobs'>('blobs');

  return (
    <div class="">
      <div class="bg-slate-200 uppercase font-semibold">
        <button
          class={cx('px-2 py-1 uppercase', { 'bg-slate-700 text-white': tab === 'blobs' })}
          onClick={() => setTab('blobs')}
        >
          Blobs
        </button>
      </div>
      <div>{tab === 'blobs' && <AdminBlobs />}</div>
    </div>
  );
}

function AdminBlobs() {
  const storageList = useRemoteResource(blobsApi.storageList, { query: {} });
  const { resource: dbList } = useRemoteResource(blobsApi.list, { query: {} });

  async function handleDeleteStorageBlob(url: string) {
    await blobsApi.storageDelete({ url });
    storageList.setResource((list) => list!.filter((b) => b.url !== url));
  }

  return (
    <div class="p4 whitespace-pre">
      <div>Storage</div>
      {storageList.resource ? (
        storageList.resource.length ? (
          <table class="w-full">
            <tbody>
              {storageList.resource.map((blob) => (
                <tr class="b b-slate-300">
                  <td class="p-1 b-r">{blob.pathname}</td>
                  <td class="p-1 b-r text-center">{Math.round((blob.size / 1024) * 10) / 10} kB</td>
                  <td class="p-1 b-r w-0">
                    <a
                      class="underline text-sky-400 block max-w-120 overflow-hidden text-ellipsis"
                      style={{ direction: 'rtl' }}
                      href={blob.url}
                    >
                      {blob.url}
                    </a>
                  </td>
                  <td class="p-1 text-center">
                    <button
                      onClick={() => handleDeleteStorageBlob(blob.url)}
                      class="px-1 text-sm uppercase rounded-md bg-red-300 hover:bg-red-400 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No blobs in storage</div>
        )
      ) : (
        <div>Loading blobs storage...</div>
      )}
      <div>DB List</div>
      <div class="whitespace-pre">{JSON.stringify(dbList, null, 2)}</div>
    </div>
  );
}
