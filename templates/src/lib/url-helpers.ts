export const hash = new (class UrlHash {
  getData(): Record<string, string> {
    const hash = window.location.hash.replace(/^#!?/, '');
    return Object.fromEntries(
      hash.split('&').map((part) => {
        return part.split('=');
      }),
    );
  }

  setData(data: Record<string, string>) {
    window.location.hash = '!' + this.generate(data);
  }

  generate(data: Record<string, string>) {
    const hash = Object.entries(data)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return hash;
  }
})();

export const hostEnv = import.meta.env.DEV
  ? 'vite'
  : window.location.hostname === 'localhost'
    ? 'local-server'
    : 'production';

export const currentBaseHost = {
  vite: 'http://localhost:5174',
  'local-server': 'http://localhost:3000',
  production: 'https://hoja.ar',
}[hostEnv];

export function publicSiteUrl(siteId: string, path: string, subdomain: string) {
  if (hostEnv === 'production') {
    return currentBaseHost.replace('https://', 'https://' + subdomain + '.') + path;
  } else if (hostEnv === 'vite') {
    return currentBaseHost + '/templates/index.html#!' + hash.generate({ siteId, path });
  } else {
    return currentBaseHost.replace('http://', 'http://' + subdomain + '.') + path;
  }
}

export function editorUrl(siteId: string, path: string) {
  return currentBaseHost + `/templates/editor.html#!${hash.generate({ siteId, path })}`;
}

export function adminUrl() {
  return currentBaseHost + '/templates/admin';
}

export const deployedUrl = (siteId: string, path: string, subdomain: string) => {};
