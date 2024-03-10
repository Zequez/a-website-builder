import './config';
import { PORT } from './config';
import app from './app';

let server: ReturnType<typeof app.listen>;

export function start() {
  try {
    server = app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
  } catch (e) {
    if ((e as any).code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Exiting...`);
      process.exit(1);
    }
  }
  return server;
}

export async function close() {
  return new Promise<void>((resolve) => {
    if (server && server.listening) {
      server.close((err) => {
        if (err) console.error(err);
        resolve();
      });
    } else resolve();
  });
}

export async function restart() {
  await close();
  return start();
}

export const endpoint = `http://localhost:${PORT}`;
