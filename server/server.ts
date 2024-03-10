import './config';
import { PORT } from './config';
import app from './app';

let server: ReturnType<typeof app.listen>;

export function start() {
  server = app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
}

export function close() {
  if (server && server.listening) server.close();
}

export function restart() {
  close();
  start();
}

export const endpoint = `http://localhost:${PORT}`;
