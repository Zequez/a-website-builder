import type { Functions as F } from '@server/routes/api/functions';
import { pipeWrapper } from './api-helper';


type FAT<T> = FirstArgumentType<T>;
type ART<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export const tsite = pipeWrapper<FAT<F['$tsite']>, ART<F['$tsite']>>('tsite');
export const checkSubdomainAvailability = pipeWrapper<FAT<F['$checkSubdomainAvailability']>, ART<F['$checkSubdomainAvailability']>>('checkSubdomainAvailability');
