import './config';
import { PORT } from './config';
import app from './app';

// let server: ReturnType<typeof app.listen>;
// let database

// export function start() {
//   app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
//   return app;
// }

// export async function close() {
//   return new Promise<void>((resolve) => {
//     console.log('Closing server');
//     if (server && server.listening) {
//       server.close((err) => {
//         if (err) console.error(err);
//         resolve();
//       });
//     } else resolve();
//   });
// }

// export async function restart() {
//   await close();
//   return start();
// }

// export function getServer() {
//   return server;
// }

// export { PORT };

// export const testEndpoint = `http://localhost:${PORT}`;
