import UploadIcon from '~icons/fa6-solid/upload';
import ImageIcon from '~icons/fa6-solid/image';
import { useAuth } from '@app/lib/AuthContext';
import * as api from '@app/lib/api';
import { useEffect } from 'preact/hooks';

export default function UploadBlobBox() {
  const { fullMember, memberAuth } = useAuth();

  return (
    <div class="text-white/60 my-2 px-1">
      {!memberAuth ? (
        <div>
          <div class="">
            <button class="flexcs mb-2 py-0.5 px-1 bg-white/10 rounded-md w-full hover:bg-white/20">
              <ImageIcon class="w-5 h-5 mr-2" />
              Some media file
            </button>
            <DropFilesZone />
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

function DropFilesZone() {
  async function handleSelectFile() {
    uploadDirectly();
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

function uploadDirectly() {}
