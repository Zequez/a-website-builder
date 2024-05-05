import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { list, del, PutBlobResult, head } from '@vercel/blob';
import { Router } from 'express';
import { T } from '@db';
import { authorize, authorizeAdmin, jsonParser } from '@server/lib/middlewares';
import { verifyToken } from '@server/lib/utils';
import { isDev } from '@server/config';

const router = Router();

export type StorageListQuery = EmptyObject;
export type StorageListResponse = Awaited<ReturnType<typeof list>>['blobs'];
router.get('/blobs/storage/list', authorizeAdmin, async (req, res) => {
  const { blobs } = await list();
  return res.status(200).json(blobs);
});

export type StorageDeleteQuery = { url: string };
export type StorageDeleteResponse = EmptyObject;
router.delete('/blobs/storage/delete', authorizeAdmin, jsonParser, async (req, res) => {
  const { url } = req.body as StorageDeleteQuery;
  await del(url);
  return res.status(200).json({});
});

export type ListQuery = EmptyObject;
export type ListResponse = Awaited<ReturnType<(typeof T)['blobs']['all']>>;
router.get('/blobs/list', authorizeAdmin, async (req, res) => {
  T.blobs.all().then((blobs) => {
    return res.status(200).json(blobs);
  });
});

// This is used by the Vercel library, not by the app directly so, no types are neccesary
router.post('/blobs/upload', jsonParser, async (req, res, next) => {
  const body = req.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users before generating the token.
        // Otherwise, you're allowing anonymous uploads.

        const jwt = JSON.parse(clientPayload || '{}').token;
        const tokenVal = verifyToken(jwt);
        if (!tokenVal) {
          throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          maximumSizeInBytes: 3 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            memberId: tokenVal.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Gotta call /blobs/onUploadComplete from the frontend manually

        console.log('blob upload completed', blob, tokenPayload);

        try {
          const { memberId } = JSON.parse(tokenPayload!);
          await handleOnUploadComplete({ url: blob.url, memberId });
        } catch (error) {
          throw new Error('Could not update user');
        }
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    // The webhook will retry 5 times waiting for a 200
    return res.status(400).json({ error: (error as Error).message });
  }
});

export type OnUploadCompleteQuery = { memberId: number; url: string };
export type OnUploadCompleteResponse = EmptyObject;
router.post('/blobs/onUploadComplete', authorize, jsonParser, async (req, res) => {
  if (!isDev) return res.status(403).json({ error: 'Forbidden' });
  const { memberId, url } = req.body as OnUploadCompleteQuery;
  if (!memberId) return res.status(400).json({ error: 'User ID is required' });
  if (!url) return res.status(400).json({ error: 'URL is required' });
  await handleOnUploadComplete({ memberId, url });
  return res.status(200).json({});
});

async function handleOnUploadComplete({ url, memberId }: { url: string; memberId: number }) {
  const blobDetails = await head(url);
  const insertedBlob = await T.blobs.insert({
    url,
    member_id: memberId,
    content_type: blobDetails.contentType,
    name: blobDetails.pathname,
    size: blobDetails.size,
  });
  return insertedBlob;
}

export default router;
