type DomainsScope = 'public' | 'members' | 'admin';

type DomainConfig = {
  host: string;
  scope: DomainsScope;
  subdomains: boolean;
};

function Domain(host: string, scope: DomainsScope = 'members'): DomainConfig {
  return { host, scope, subdomains: host.startsWith('.') };
}

export const devDomains = [
  Domain('hoja.localhost', 'admin'),
  Domain('hojaweb.localhost', 'admin'),
  Domain('localhost', 'admin'),
  Domain('.hoja.localhost'),
  Domain('.hojaweb.localhost', 'public'),
];

export const prodDomains = [
  Domain('mdp.hoja.ar', 'admin'),
  Domain('hoja.ar', 'admin'),
  Domain('hojaweb.xyz', 'admin'),
  Domain('hojaweb.vercel.app', 'admin'),
  Domain('.hoja.ar', 'members'),
  Domain('.mdp.hoja.ar', 'members'),
  Domain('.hojaweb.xyz', 'public'),
  Domain('.hojaweb.vercel.app', 'public'),
];

export const devRootHostnames = devDomains
  .filter((d) => !d.subdomains && d.scope === 'admin')
  .map((d) => d.host);

export const prodRootHostnames = prodDomains
  .filter((d) => !d.subdomains && d.scope === 'admin')
  .map((d) => d.host);

export function resolveScopes(scope: string): DomainsScope[] {
  return scope === 'admin'
    ? ['admin', 'public', 'members']
    : scope === 'members'
      ? ['members', 'public']
      : ['public'];
}
