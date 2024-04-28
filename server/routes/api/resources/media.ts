import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { Router } from 'express';
import { T } from '@db';
import { authorize, jsonParser } from '@server/lib/middlewares';
import { googleDriveForMember } from '@server/lib/oauth';
import { verifiedTokenFromHeader, verifyToken } from '@server/lib/utils';

const router = Router();

export type RoutePostMediaUploadUrlQuery = {
  fileName: string;
};
export type RoutePostMediaUploadUrl = {
  uploadUrl: string;
  id: string;
};
router.post('/media/upload-url', authorize, jsonParser, async (req, res) => {
  const fileMetadata = {
    name: req.body.fileName,
  };

  if (!fileMetadata.name) {
    return res.status(400).json({ error: 'File name is required' });
  }

  const member = await T.members.find(req.tokenMember!.id);
  if (!member.google_tokens) {
    return res.status(401).json({ error: 'Member does not have Google tokens' });
  }

  const drive = googleDriveForMember(member.google_tokens);

  try {
    const { data } = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, webViewLink',
    });
    return res.status(200).json({ uploadUrl: data.webViewLink, id: data.id });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Google request failed' });
  }
});

// export type RoutePostMediaUploadQuery = {
//   fileName: string;
// };
// export type RoutePostMediaUpload = {
//   uploadUrl: string;
//   id: string;
// };
router.post('/media/upload', jsonParser, async (req, res, next) => {
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
