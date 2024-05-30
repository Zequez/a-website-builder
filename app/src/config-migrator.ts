export default function migrateConfig(unknownConfig: any): Config {
  let newConfig: Config = JSON.parse(JSON.stringify(unknownConfig)); // Deep clone
  for (const [vFrom_vTo, migration] of Object.entries(MIGRATIONS)) {
    const vFrom = Number(vFrom_vTo.split('_')[0]);
    if (newConfig.version === vFrom) migration(newConfig);
  }

  return newConfig;
}

const MIGRATIONS = {
  '0_1': (config: Config) => {
    config.version = 1 as any;
    config.pages.forEach((p) => {
      p.version = 1;
      p.elements.forEach((e) => {
        e.version = 1;
      });
    });
  },
  '1_2': (config: Config) => {
    config.version = 2 as any;
    config.iteration = 1;
  },
};

export const latestConfigVersion = Object.keys(MIGRATIONS)
  .reverse()[0]
  .split('_')[1] as unknown as number;
