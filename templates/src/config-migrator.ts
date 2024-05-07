import { validateConfig } from './config-validator';

export default function migrateConfig(unknownConfig: any): Config | any {
  const errors = validateConfig(unknownConfig);
  let newConfig = { ...unknownConfig };

  for (let error of errors) {
    if (error.params.missingProperty === 'icon') {
      newConfig = addFavicon(newConfig);
    }
  }

  return newConfig;
}

function addFavicon(unknownConfig: any): Config {
  const patch: Pick<Config, 'icon'> = {
    icon: {
      type: 'emoji',
      value: '🏠',
    },
  };

  return { ...unknownConfig, ...patch };
}
