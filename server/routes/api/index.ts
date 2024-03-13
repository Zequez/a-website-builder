import { Router } from 'express';

import auth from './auth';
import sites from './resources/sites';
import members from './resources/members';
import files from './resources/files';

const mainRouter = Router();

mainRouter.use('/auth', auth);
mainRouter.use(sites);
mainRouter.use(members);
mainRouter.use(files);

mainRouter.all('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default mainRouter;
