import Ajv from 'ajv';
import configSchema from './config-schema';
import e from 'express';

export default function createValidator() {
  const ajv = new Ajv();
  return ajv.compile(configSchema as any);
}

export type ValidationError = { path: string; message: string; params: any };

export function valErr(msg: string, path?: string, params?: any): ValidationError {
  return { message: msg, path: path || '*', params: params || {} };
}

function ajvToValidationError(e: any): ValidationError {
  return {
    path: e.instancePath || '',
    message: e.message || '',
    params: e.params || '',
  };
}

export function validateConfig(config: any): ValidationError[] {
  const validator = createValidator();
  if (validator(config)) {
    return [];
  } else {
    console.log('Errors:', validator.errors);
    return validator.errors!.map(ajvToValidationError);
  }
}
