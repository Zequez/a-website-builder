import { upload } from '@vercel/blob/client';
import { API_BASE_URL } from './api-helper';

export default async function uploader(
  files: File[],
  siteId: string,
  accessToken: string,
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  for (const file of files) {
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: API_BASE_URL + 'pipe/handleUpload',
      clientPayload: JSON.stringify({
        token: accessToken,
        siteId,
      }),
    });
    uploadedUrls.push(blob.url);
  }

  return uploadedUrls;
}
