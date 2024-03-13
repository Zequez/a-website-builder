import { useEffect, useState } from 'preact/hooks';
import { MemberAuth, useAuth } from '@app/components/Auth';
import { useRemoteResource, member as apiMember, postFile, postSite } from '@app/lib/api';
import { SiteWithFiles } from '@db';
import { EditorFile, Site } from '../types';

export default function useRemoteSites(auth: MemberAuth | null) {
  const { data: member, error } = useRemoteResource(apiMember, auth?.member?.id, auth);

  async function writeFile(editorFile: EditorFile) {
    if (!editorFile.id) throw 'No creating files yet';
    if (!auth)
      return Promise.resolve({
        error: "You are not logged in, can't store remote files",
        data: null,
      });
    return await postFile(
      {
        id: editorFile.id.toString(),
        name: editorFile.name,
        data: btoa(editorFile.content),
      },
      auth.token,
    );
  }

  async function publishSite(site: { name: string; localName: string }) {
    if (!auth)
      return Promise.resolve({ error: "You are not logged in, can't publish", data: null });
    return await postSite({ name: site.name, localName: site.localName }, auth.token);
  }

  return { sites: member?.sites || null, error, writeFile, publishSite };
}
