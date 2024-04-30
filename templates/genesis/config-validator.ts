import Ajv from 'ajv';
import configSchema from './config-schema.yml';

export default function createValidator() {
  const ajv = new Ajv();
  return ajv.compile(configSchema as any);
}
