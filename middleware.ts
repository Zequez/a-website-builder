// import { rootHostnames } from './server/root-hostnames';
// import { prodDomains } from './server/domains';

// Actually we don't need this anymore
// Because every site on Hoja is an Hoja site
// The core pages are just served on the /templates path for now
// Maybe I'll add a dedicated subdomain for the core pages later

// const excludedPaths = [
//   '_api_/',
//   '_member_site_/',
//   'assets/chunks',
//   'assets/entries',
//   'assets/static',
//   'templates/assets',
//   'templates/index.html',
//   'templates/editor.html',
//   'templates/admin.html',
// ];

export const config = {
  // matcher: [`/((?!${excludedPaths.join('|')}).*)`],
  matcher: [],
};

// const rootHostnames = prodDomains
//   .filter((d) => !d.subdomains && d.scope === 'admin')
//   .map((d) => d.host);

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const headers = new Headers();
  headers.set('x-middleware-next', '1');
  return new Response(null, { headers });

  // const isRootHostname = rootHostnames.indexOf(url.hostname) !== -1;

  // // Do not serve
  // if (isRootHostname) {
  //   // Serve the normal app distribution; hopefully from the static files
  //   headers.set('x-middleware-next', '1');
  // } else {
  //   // It's a member site, rewrite to /_member_site_/ so it does not load the static files
  //   url.pathname = `/_member_site_${url.pathname}`;

  //   headers.set('x-middleware-rewrite', url.toString());
  // }

  // return new Response(null, { headers });
}
