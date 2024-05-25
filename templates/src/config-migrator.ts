export default function migrateConfig(unknownConfig: any): Config | any {
  let newConfig: Config = unknownConfig;
  if (!unknownConfig.version) {
    newConfig = v0_v1(newConfig);
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
