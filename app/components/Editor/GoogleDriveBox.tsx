/// <reference types="google.accounts" />

import UploadIcon from '~icons/fa6-solid/upload';
import ImageIcon from '~icons/fa6-solid/image';
import { useAuth } from '@app/lib/AuthContext';
import * as api from '@app/lib/api';
import { useEffect } from 'preact/hooks';

export default function GoogleDriveBox() {
  const { fullMember } = useAuth();

  useEffect(() => {
    // Load Google Client API if not already loaded
    // https://apis.google.com/js/api.js
    if (!document.getElementById('google-client-api-script') && !window.google) {
      const script = document.createElement('script');
      script.id = 'google-client-api-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div class="text-white/60 my-2 px-1">
      {fullMember ? (
        <div>
          {fullMember.google ? (
            <div class="">
              <button class="flexcs mb-2 py-0.5 px-1 bg-white/10 rounded-md w-full hover:bg-white/20">
                <ImageIcon class="w-5 h-5 mr-2" />
                Some media file
              </button>
              <DropFilesZone />
            </div>
          ) : (
            <a
              class="block text-white px-4 py-2rounded-md b b-black/20 bg-white/20 hover:bg-white/30"
              href="/account"
              target="_blank"
            >
              Connect Google Drive
            </a>
          )}
        </div>
      ) : (
        <div class="px-4 py-2 rounded-md text-white bg-black/20">Loading...</div>
      )}
    </div>
  );
}

function DropFilesZone() {
  async function handleSelectFile() {
    uploadDirectly();
    // const input = document.createElement('input');
    // input.type = 'file';
    // input.multiple = true;
    // input.onchange = async () => {
    //   if (input.files) {
    //     for (let i = 0; i < input.files.length; i++) {
    //       const file = input.files[i];
    //       console.log(input.files[i]);
    //       const { data, error } = await api.mediaUploadUrl({ fileName: file.name });
    //       if (data) {
    //         data.uploadUrl;
    //       } else {
    //         console.error('Some error', error);
    //         break;
    //       }
    //     }
    //   }
    // };
    // input.click();

    // const { data, error } = await api.mediaUploadUrl({ fileName: 'test.txt' });
    // if (data) {
    //   console.log(data);
    //   const formData = new FormData();
    //   const content = new Blob(['foo'], { type: 'text/plain' });
    //   formData.append('file', content, 'test.txt');
    //   const response = await fetch(data.uploadUrl, {
    //     method: 'PUT',
    //     body: formData,
    //   });
    //   console.log(response);
    //   if (response.ok) {
    //     const responseData = await response.json();
    //     console.log(responseData);
    //   }
    // }
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

function uploadDirectly() {
  // Array of API discovery doc URLs for APIs used by the application
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

  // Authorization scopes required by the API
  const SCOPES = 'https://www.googleapis.com/auth/drive.file';

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: () => {
      console.log('Got credentials!');
    },
  });
  google.accounts.id.prompt();
}

// gapi.load('client:auth2', () => {
//   gapi.client
//     .init({
//       apiKey: GOOGLE_API_KEY,
//       clientId: GOOGLE_CLIENT_ID,
//       discoveryDocs: DISCOVERY_DOCS,
//       scope: SCOPES,
//     })
//     .then(() => {
//       console.log('Initialized google client');
//       // Google API client is initialized, now authorize the user
//       gapi.auth.authorize({}, (authResult) => {
//         console.log(authResult);
//       });
//     });
// });

// console.log(window.gapi);
// }
