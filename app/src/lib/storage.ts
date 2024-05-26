import migrateConfig from '../config-migrator';
import { validateConfig } from '../config-validator';

const noLocalStorage = typeof localStorage === 'undefined';

export function setAccessKeyToken(siteId: string, token: string) {
  localStorage.setItem(`${siteId}-token`, token);
}

export function getAccessKeyToken(siteId: string | null) {
  if (!siteId || noLocalStorage) return null;
  return localStorage.getItem(`${siteId}-token`) || null;
}

export function setMemberToken(token: string) {
  localStorage.setItem('member-token', token);
}

export function getMemberToken() {
  if (noLocalStorage) return null;
  return localStorage.getItem('member-token') || null;
}

const LOCAL_CONFIG_KEY = (siteId: string) => `local_config_save_${siteId}`;
export function getLocalConfigSave(siteId: string): Config | null {
  if (noLocalStorage) return null;
  const config = localStorage.getItem(LOCAL_CONFIG_KEY(siteId));
  try {
    const parsedConfig = config ? (JSON.parse(config) as Config) : null;
    const errors = validateConfig(parsedConfig);
    const hopefullyValidConfig = errors.length ? migrateConfig(parsedConfig) : parsedConfig;
    return hopefullyValidConfig;
  } catch (e) {
    localStorage.removeItem(LOCAL_CONFIG_KEY(siteId));
    return null;
  }
}

let saveDebounce: ReturnType<typeof setTimeout>;
export function setLocalConfigSave(siteId: string, config: Config) {
  if (noLocalStorage) return;
  if (saveDebounce) clearTimeout(saveDebounce);
  saveDebounce = setTimeout(() => {
    localStorage.setItem(LOCAL_CONFIG_KEY(siteId), JSON.stringify(config));
  }, 250);
}
