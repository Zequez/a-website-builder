import type { JSX } from 'preact';

export type Member = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
};

declare global {
  namespace Vike {
    interface PageContext {
      isHydration: boolean;
      // Type of pageContext.user
      locale: string;
      pageProps: Record<string, any>;
      config: {
        title: string;
        description: string;
      };
      Page: () => JSX.Element;
      // Refine type of pageContext.Page (it's `unknown` by default)
      // Page: () => JSX.Element
    }
  }
}
