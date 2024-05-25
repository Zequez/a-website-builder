import { validateConfig } from './config-validator';

export default function migrateConfig(unknownConfig: any): Config | any {
  let newConfig: Config = unknownConfig;
  if (!unknownConfig.version) {
    newConfig = preVersioned(unknownConfig); // Delete all this after migrating everything on production
    newConfig = v0_v1(newConfig);
  }
  return newConfig;
}

function preVersioned(unknownConfig: any): Config {
  const newConfig = { ...unknownConfig };

  if (!newConfig.icon) {
    newConfig.icon = { type: 'emoji', value: '🏠' };
  }

  if (!newConfig.theme) {
    newConfig.theme = {
      hue: 60,
      saturation: 50,
      lightness: 50,
      pattern: 'noise',
      patternIntensity: 5,
    };
    delete newConfig.themeColor;
  }

  newConfig.pages.forEach((page: any) => {
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
    } else {
      page.elements.forEach((el: any) => {
        if (el.type === 'TextElementConfig') {
          el.type = 'Text';
        }
        if (el.type === 'Image') {
          if (!el.displaySize) {
            el.displaySize = 'original';
          }
          if (!el.originalSize) {
            el.originalSize = { width: 0, height: 0 };
          }
        }
      });
    }
  });

  if (!newConfig.header) {
    newConfig.header = { imageUrl: '' };
  }

  return newConfig;
}

function v0_v1(v0Config: Config): Config {
  const newConfig = { ...v0Config, version: 1 };
  newConfig.pages.forEach((p) => {
    p.version = 1;
    p.elements.forEach((e) => {
      e.version = 1;
    });
  });
  return { ...v0Config, version: 1 };
}
