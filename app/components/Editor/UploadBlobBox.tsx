import UploadIcon from '~icons/fa6-solid/upload';
import ImageIcon from '~icons/fa6-solid/image';
import { useAuth } from '@app/lib/AuthContext';
import { API_BASE_URL } from '@app/lib/api';
import { useEffect, useState } from 'preact/hooks';
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { C } from '@unocss/preset-mini/dist/shared/preset-mini.Dh95saIh';

export default function UploadBlobBox() {
  const { fullMember, memberAuth } = useAuth();

  return (
    <div class="text-white/60 my-2 px-1">
      {memberAuth ? (
        <div>
          <div class="">
            <button class="flexcs mb-2 py-0.5 px-1 bg-white/10 rounded-md w-full hover:bg-white/20">
              <ImageIcon class="w-5 h-5 mr-2" />
              Some media file
            </button>
            <DropFilesZone token={memberAuth.token} />
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

function DropFilesZone({ token }: { token: string }) {
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  async function handleSelectFile() {
    // uploadDirectly();

    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      if (input.files) {
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          const newBlob = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: API_BASE_URL + '/media/upload',
            clientPayload: JSON.stringify({ token }),
          });

          console.log(newBlob);
          setBlob(newBlob);
        }
      }
    };
    input.click();
  }

  return (
    <button
      onClick={handleSelectFile}
      class="w-full b-4 b-white/60 b-dashed rounded-lg py-4 flexcc hover:bg-white/10"
    >
      <UploadIcon class="mr-2 h-8 w-8" /> Upload files
    </button>
  );
}

// function uploadDirectly() {}
