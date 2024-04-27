import { T } from '@db';
import { authorize, jsonParser } from '@server/lib/middlewares';
import { googleDriveForMember } from '@server/lib/oauth';
import { Router } from 'express';

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

export default router;
