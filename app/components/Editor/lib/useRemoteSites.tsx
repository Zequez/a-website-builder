import { useEffect, useState } from 'preact/hooks';
import { MemberAuth, useAuth } from '@app/components/Auth';
import {
  useRemoteResource,
  member as apiMember,
  putFile as apiPutFile,
  postFile as apiPostFile,
  deleteFile as apiDeleteFile,
  putSite as apiPutSite,
  postSite as apiPostSite,
} from '@app/lib/api';
import { SiteWithFiles } from '@db';
import { LocalFile, Site } from '../types';

const noAuthPromise = Promise.resolve({
  error: 'Must be logged in for this',
  data: null,
});

export default function useRemoteSites(auth: MemberAuth | null) {
  const { data: member, error } = useRemoteResource(apiMember, auth?.member?.id, auth);

  async function putFile(file: { id: string; name: string; content: string }) {
    if (!auth) return noAuthPromise;

    return await apiPutFile(
      {
        id: file.id,
        name: file.name,
        data: btoa(file.content),
      },
      auth.token,
    );
  }

  async function putSite(site: { id: string; name: string; localName: string }) {
    if (!auth) return noAuthPromise;
    return await apiPutSite(site, auth.token);
  }

  async function publishSite(site: { name: string; localName: string }) {
    if (!auth) return noAuthPromise;
    return await apiPostSite({ name: site.name, localName: site.localName }, auth.token);
  }

  async function postFile(siteId: number, file: { name: string; content: string }) {
    if (!auth) return noAuthPromise;
    return await apiPostFile(
      { name: file.name, data: btoa(file.content), site_id: siteId },
      auth.token,
    );
  }

  async function deleteFile(id: string) {
    if (!auth) return noAuthPromise;
    return await apiDeleteFile(id, auth.token);
  }

  return {
    sites: member?.sites || null,
    error,
    putFile,
    postFile,
    putSite,
    publishSite,
    deleteFile,
  };
}
