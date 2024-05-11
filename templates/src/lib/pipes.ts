import type { Functions as F } from '@server/api/functions';
import { pipeWrapper } from './api-helper';

type FAT<T> = FirstArgumentType<T>;
type ART<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

/* GENERATED */

export const tsite = pipeWrapper<FAT<F['$tsite']>, ART<F['$tsite']>>('tsite');
export const checkDomainAvailability = pipeWrapper<FAT<F['$checkDomainAvailability']>, ART<F['$checkDomainAvailability']>>('checkDomainAvailability');
export const adminTsites = pipeWrapper<FAT<F['$adminTsites']>, ART<F['$adminTsites']>>('adminTsites');
export const deploySite = pipeWrapper<FAT<F['$deploySite']>, ART<F['$deploySite']>>('deploySite');
export const tsiteSetConfig = pipeWrapper<FAT<F['$tsiteSetConfig']>, ART<F['$tsiteSetConfig']>>('tsiteSetConfig');
export const setAccessKey = pipeWrapper<FAT<F['$setAccessKey']>, ART<F['$setAccessKey']>>('setAccessKey');
export const adminSaveSite = pipeWrapper<FAT<F['$adminSaveSite']>, ART<F['$adminSaveSite']>>('adminSaveSite');
export const adminCreateSite = pipeWrapper<FAT<F['$adminCreateSite']>, ART<F['$adminCreateSite']>>('adminCreateSite');
export const adminDeleteSite = pipeWrapper<FAT<F['$adminDeleteSite']>, ART<F['$adminDeleteSite']>>('adminDeleteSite');
export const adminRestoreSite = pipeWrapper<FAT<F['$adminRestoreSite']>, ART<F['$adminRestoreSite']>>('adminRestoreSite');
export const adminDeleteSiteForGood = pipeWrapper<FAT<F['$adminDeleteSiteForGood']>, ART<F['$adminDeleteSiteForGood']>>('adminDeleteSiteForGood');
export const tokenFromAccessKey = pipeWrapper<FAT<F['$tokenFromAccessKey']>, ART<F['$tokenFromAccessKey']>>('tokenFromAccessKey');
export const tokenFromMemberCredentials = pipeWrapper<FAT<F['$tokenFromMemberCredentials']>, ART<F['$tokenFromMemberCredentials']>>('tokenFromMemberCredentials');