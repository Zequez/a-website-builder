import { QQ, pool, T } from '@db';
import { Tsites } from '@db/schema';
import migrateConfig from '../app/src/config-migrator';
import { validateConfig } from '../app/src/config-validator';

const tsites = await QQ<Tsites>`SELECT id, config, deploy_config, name FROM tsites`;

for (const tsite of tsites) {
  console.log(`Checking if migration needed for site config ${tsite.name}`);

  const newConfig = attemptMigrate(tsite.config as Config);
  const newDeployConfig = tsite.deploy_config
    ? attemptMigrate(tsite.deploy_config as Config)
    : null;

  const update: { config?: Config; deploy_config?: Config; updated_at: Date } = {
    updated_at: new Date(),
  };

  if (JSON.stringify(newConfig) !== JSON.stringify(tsite.config)) {
    update.config = newConfig;
  }

  if (newDeployConfig && JSON.stringify(newDeployConfig) !== JSON.stringify(tsite.deploy_config)) {
    update.deploy_config = newDeployConfig;
  }

  if (update.config || update.deploy_config) {
    console.log('Configuration changed; updating');
    await T.tsites.update(tsite.id, update);
  }
}

function attemptMigrate(config: Config) {
  let newConfig: Config;
  try {
    newConfig = migrateConfig(config);
  } catch (e) {
    console.error(e);
    console.log(config);
    throw e;
  }

  if (newConfig) {
    const errors = validateConfig(newConfig);
    if (errors.length) {
      console.error(errors);
      console.log(JSON.stringify(newConfig, null, 2));
      throw 'Migration failed';
    }
  }
  return newConfig;
}

pool.end();
