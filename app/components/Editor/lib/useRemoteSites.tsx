import { useEffect, useState } from 'preact/hooks';
import { MemberAuth, useAuth } from '@app/components/Auth';
import { useRemoteResource, member as apiMember } from '@app/lib/api';
import { SiteWithFiles } from '@db';

export default function useRemoteSites(auth: MemberAuth | null) {
  const { data: member, error } = useRemoteResource(apiMember, auth?.member?.id, auth);
  return { sites: member?.sites || null, error };
}
