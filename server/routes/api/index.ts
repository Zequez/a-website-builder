import { Router } from 'express';

import auth from './auth';
import resources from './resources';

const mainRouter = Router();

mainRouter.use('/auth', auth);
mainRouter.use(resources);

mainRouter.all('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default mainRouter;
