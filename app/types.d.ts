import type { JSX } from 'preact';

// import gapi from @types/gapi
// import type { GoogleAccounts } from '@types/google.accounts';

export type Member = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
};

declare global {
  const GOOGLE_API_KEY: string;
  const GOOGLE_CLIENT_ID: string;
}

declare global {
  namespace Vike {
    interface PageContext {
      isHydration: boolean;
      // Type of pageContext.user
      locale: string;
      pageProps: Record<string, any>;
      config: {
        ssr: boolean;
        title: string;
        description: string;
        'es.title': string;
        'es.description': string;
      };
      Page: () => JSX.Element;
      // Refine type of pageContext.Page (it's `unknown` by default)
      // Page: () => JSX.Element
    }
  }
}

// Add gapi to window
// declare global {
//   interface Window {
//     google: any;
//   }
// }
