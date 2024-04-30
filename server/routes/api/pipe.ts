import { authorize, jsonParser } from '@server/lib/middlewares';
import { Request, Response, Router } from 'express';
import { Functions } from './functions';
import { validateTokenExpiry, verifiedTokenFromHeader } from '@server/lib/utils';

const router = Router();

router.post('/pipe/:fun', jsonParser, async (req, res) => {
  const fun = req.params.fun;
  const query = req.body as any;
  return await runPipe(fun, query, req, res);
});

router.get('/pipe/:fun', async (req, res, next) => {
  const fun = req.params.fun;
  const query = req.query as any;
  return await runPipe(fun, query, req, res);
});

async function runPipe(fun: string, query: any, req: Request, res: Response) {
  let maybeTokenMember = verifiedTokenFromHeader(req.headers);
  if (maybeTokenMember && !validateTokenExpiry(maybeTokenMember)) maybeTokenMember = null;

  const functions = new Functions(maybeTokenMember);

  const key = `$${fun}` as keyof typeof functions;

  if (functions[key]) {
    const funToCall = functions[key] as any;
    try {
      const data = await funToCall.call(functions, query || {});
      return res.status(200).json({ data });
    } catch (err: any) {
      console.log('Pipe error', err);
      return res.status(err.status || 500).json({ error: err.message, data: err.data || null });
    }
  } else {
    return res.status(404).json({ error: 'Function not found' });
  }
}

export default router;
