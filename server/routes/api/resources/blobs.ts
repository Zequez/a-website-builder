import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { list, del } from '@vercel/blob';
import { Router } from 'express';
import { T } from '@db';
import { authorize, authorizeAdmin, jsonParser } from '@server/lib/middlewares';
import { verifyToken } from '@server/lib/utils';

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
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
          tokenPayload: JSON.stringify({
            userId: tokenVal.id,
            // optional, sent to your server on upload completion
            // you could pass a user id from auth, or a value from clientPayload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        console.log('blob upload completed', blob, tokenPayload);

        try {
          // Run any logic after the file upload completed
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
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

export default router;
