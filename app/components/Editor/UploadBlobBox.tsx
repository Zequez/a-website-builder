import UploadIcon from '~icons/fa6-solid/upload';
import ImageIcon from '~icons/fa6-solid/image';
import { MemberAuth, useAuth } from '@app/lib/AuthContext';
import * as blobsApi from '@server/routes/api/resources/blobs.client';
import { useEffect, useState } from 'preact/hooks';
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { C } from '@unocss/preset-mini/dist/shared/preset-mini.Dh95saIh';
import { useRemoteResource } from '@app/lib/apiHelpers';
import { Blob_ } from '@db';

export default function UploadBlobBox() {
  const { fullMember, memberAuth } = useAuth();
  const blobsList = useRemoteResource(blobsApi.list, { query: {} });

  function copyBlobUrl(blob: Blob_) {
    navigator.clipboard.writeText(blob.url);
  }

  return (
    <div class="text-white/60 my-2 px-1">
      {memberAuth ? (
        <div>
          <div class="">
            {blobsList.resource && blobsList.resource.length
              ? blobsList.resource.map((blob) => (
                  <button
                    onClick={() => copyBlobUrl(blob)}
                    class="flexcs mb-2 py-0.5 px-1 bg-white/10 rounded-md w-full hover:bg-white/20"
                  >
                    <ImageIcon class="w-5 h-5 mr-2" />
                    {blob.name}
                  </button>
                ))
              : null}

            <DropFilesZone
              memberAuth={memberAuth}
              onUploadingDone={async () => await blobsList.refetch()}
            />
          </div>
        </div>
      ) : (
        <div class="px-4 py-2 rounded-md text-white bg-black/20 text-center">
          Media file uploading available upon{' '}
          <a href="/join" class="underline text-sky-400">
            registration
          </a>
        </div>
      )}
    </div>
  );
}

function DropFilesZone({
  memberAuth,
  onUploadingDone,
}: {
  memberAuth: MemberAuth;
  onUploadingDone: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleSelectFile() {
    // uploadDirectly();
    if (uploading) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      if (input.files) {
        setUploading(true);
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          const newBlob = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: blobsApi.uploadUrl,
            clientPayload: JSON.stringify({ token: memberAuth.token }),
          });

          if (import.meta.env.DEV) {
            // onUploadCompleted does not run on localhost, so we need to manually call it
            // The url is inactive on production
            await blobsApi.onUploadComplete({ url: newBlob.url, memberId: memberAuth.member.id });
          }

          await onUploadingDone();
        }
        setUploading(false);
      }
    };
    input.click();
  }

  return (
    <button
      onClick={handleSelectFile}
      class="w-full b-4 b-white/60 b-dashed rounded-lg py-4 flexcc hover:bg-white/10"
    >
      <UploadIcon class="mr-2 h-8 w-8" /> {uploading ? 'Uploading...' : 'Upload files'}
    </button>
  );
}

// function uploadDirectly() {}
