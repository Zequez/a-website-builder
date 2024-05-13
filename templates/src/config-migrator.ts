import { validateConfig } from './config-validator';

export default function migrateConfig(unknownConfig: any): Config | any {
  const errors = validateConfig(unknownConfig);
  let newConfig = { ...unknownConfig };

  for (let error of errors) {
    if (error.params.missingProperty === 'icon') {
      newConfig = addFavicon(newConfig);
    } else if (['theme', 'pattern', 'patternIntensity'].includes(error.params.missingProperty)) {
      newConfig = addTheme(newConfig);
    } else if (['elements'].includes(error.params.missingProperty)) {
      newConfig = upgradePageConfig(newConfig);
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

function upgradePageConfig(unknownConfig: any): Config {
  unknownConfig.pages.forEach((page: any) => {
    if (typeof page.elements === 'undefined') {
      page.elements = [
        {
          uuid: crypto.randomUUID(),
          type: 'Text',
          value: page.content,
          compiledValue: `<p>${page.content}</p>`,
          boxColor: 'none',
        } as TextElementConfig,
      ];
      delete page.content;
    }
  });
  return unknownConfig;
}
