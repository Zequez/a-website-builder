import { useEffect, useState } from 'preact/hooks';
import { MemberAuth, useAuth } from '@app/components/Auth';
import {
  useRemoteResource,
  member as apiMember,
  putFile as apiPutFile,
  postFile as apiPostFile,
  deleteFile as apiDeleteFile,
  postSite,
} from '@app/lib/api';
import { SiteWithFiles } from '@db';
import { EditorFile, Site } from '../types';

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

  async function publishSite(site: { name: string; localName: string }) {
    if (!auth) return noAuthPromise;
    return await postSite({ name: site.name, localName: site.localName }, auth.token);
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

  return { sites: member?.sites || null, error, putFile, postFile, publishSite, deleteFile };
}
