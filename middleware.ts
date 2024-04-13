import rootHostnames from './server/root-hostnames';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /_api_ routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!_api_/|_member_site_/|assets/chunks|assets/entries|assets/static/).*)',
  ],
};

const locahostRewriteHostname = 'localhost';

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const headers = new Headers();

  const isRootHostname = rootHostnames.indexOf(url.hostname) !== -1;

  if (url.hostname.endsWith('.localhost')) {
    url.hostname = locahostRewriteHostname;
  }

  if (isRootHostname) {
    // Serve the normal app distribution; hopefully from the static files
    headers.set('x-middleware-next', '1');
  } else {
    // It's a member site, rewrite to /_member_site_/ so it does not load the static files
    url.pathname = `/_member_site_${url.pathname}`;

    headers.set('x-middleware-rewrite', url.toString());
  }

  return new Response(null, { headers });
}
