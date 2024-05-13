import 'dotenv/config';

import * as configSchemaTypings from './config-schema-typings';
import * as dbTypings from './db-typings';
import * as pipeApiHelper from './pipe-api-helper';

configSchemaTypings.watch();
pipeApiHelper.watch();
dbTypings.generate();
