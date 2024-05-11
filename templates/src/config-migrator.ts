import { validateConfig } from './config-validator';

export default function migrateConfig(unknownConfig: any): Config | any {
  const errors = validateConfig(unknownConfig);
  let newConfig = { ...unknownConfig };

  for (let error of errors) {
    if (error.params.missingProperty === 'icon') {
      newConfig = addFavicon(newConfig);
    } else if (['theme', 'pattern', 'patternIntensity'].includes(error.params.missingProperty)) {
      newConfig = addTheme(newConfig);
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

function addTheme(unknownConfig: any): Config {
  let patch: Pick<Config, 'theme'> = {
    theme: {
      hue: 60,
      saturation: 50,
      lightness: 50,
      pattern: 'noise',
      patternIntensity: 5,
    },
  };

  let newConfig = { ...unknownConfig };

  if (typeof newConfig.themeColor !== 'undefined') {
    delete newConfig.themeColor;
  }

  return { ...newConfig, ...patch };
}
