import type { Functions as F } from '@server/api/functions';
import { pipeWrapper } from './api-helper';

type FAT<T> = FirstArgumentType<T>;
type ART<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

/* GENERATED */

export const tsite = pipeWrapper<FAT<F['$tsite']>, ART<F['$tsite']>>('tsite');
export const checkSubdomainAvailability = pipeWrapper<FAT<F['$checkSubdomainAvailability']>, ART<F['$checkSubdomainAvailability']>>('checkSubdomainAvailability');
export const tsites = pipeWrapper<FAT<F['$tsites']>, ART<F['$tsites']>>('tsites');
export const deploySite = pipeWrapper<FAT<F['$deploySite']>, ART<F['$deploySite']>>('deploySite');
export const createSite = pipeWrapper<FAT<F['$createSite']>, ART<F['$createSite']>>('createSite');
export const setAccessKey = pipeWrapper<FAT<F['$setAccessKey']>, ART<F['$setAccessKey']>>('setAccessKey');
export const tsiteSetConfig = pipeWrapper<FAT<F['$tsiteSetConfig']>, ART<F['$tsiteSetConfig']>>('tsiteSetConfig');
export const tokenFromAccessKey = pipeWrapper<FAT<F['$tokenFromAccessKey']>, ART<F['$tokenFromAccessKey']>>('tokenFromAccessKey');
export const tokenFromMemberCredentials = pipeWrapper<FAT<F['$tokenFromMemberCredentials']>, ART<F['$tokenFromMemberCredentials']>>('tokenFromMemberCredentials');