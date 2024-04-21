import type { Config } from 'vike/types';
import ssrEffect from './ssrEffect';

export default {
  meta: {
    title: {
      // Make the value of `title` available on both the server- and client-side
      env: { server: true, client: true },
    },
    'es.title': {
      // Make the value of `title` available on both the server- and client-side
      env: { server: true, client: true },
    },
    description: {
      // Make the value of `description` available only on the server-side
      env: { server: true, client: true },
    },
    'es.description': {
      env: { server: true, client: true },
    },
    ssr: {
      env: { config: true, client: true, server: true },
      effect: ssrEffect,
    },
  },
  // https://vike.dev/passToClient
  passToClient: ['pageProps', 'documentProps', 'locale'],
  // https://vike.dev/clientRouting
  clientRouting: true,
} satisfies Config;
