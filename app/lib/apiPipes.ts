import type { Functions as F } from '@server/api/functions';
import { pipeWrapper } from './apiHelpers';

type FirstArgumentType<T> = T extends (arg1: infer U, ...args: any[]) => any ? U : never;

export const membersWithSharedResources = pipeWrapper<
  FirstArgumentType<F['$membersWithSharedResources']>,
  Awaited<ReturnType<F['$membersWithSharedResources']>>
>('membersWithSharedResources');

export const sharedResourcesByMemberId = pipeWrapper<
  FirstArgumentType<F['$sharedResourcesByMemberId']>,
  Awaited<ReturnType<F['$sharedResourcesByMemberId']>>
>('sharedResourcesByMemberId');

// memberSites
export const memberSites = pipeWrapper<
  FirstArgumentType<F['$memberSites']>,
  Awaited<ReturnType<F['$memberSites']>>
>('memberSites');

export const siteFiles = pipeWrapper<
  FirstArgumentType<F['$siteFiles']>,
  Awaited<ReturnType<F['$siteFiles']>>
>('siteFiles');
