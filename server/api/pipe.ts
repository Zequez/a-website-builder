import { jsonParser } from '@server/lib/middlewares';
import { Request, Response, Router } from 'express';
import { Functions } from './functions';

const router = Router();

router.post('/pipe/:fun', jsonParser, async (req, res) => {
  const fun = req.params.fun;
  const query = req.body as any;
  return await runPipe(fun, query, req, res);
});

async function runPipe(fun: string, query: any, req: Request, res: Response) {
  const functions = new Functions(req);
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
