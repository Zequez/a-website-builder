import { useEffect, useState } from 'preact/hooks';
import { MemberAuth, useAuth } from '@app/components/Auth';
import { useRemoteResource, member as apiMember, postFile } from '@app/lib/api';
import { SiteWithFiles } from '@db';
import { EditorFile } from '../types';

export default function useRemoteSites(auth: MemberAuth | null) {
  const { data: member, error } = useRemoteResource(apiMember, auth?.member?.id, auth);

  async function writeFile(editorFile: EditorFile) {
    if (!editorFile.id) throw 'No creating files yet';
    if (!auth) return Promise.resolve({ error: "You are not logged in, can't store remote files" });
    return await postFile(
      {
        id: editorFile.id.toString(),
        name: editorFile.name,
        data: btoa(editorFile.content),
      },
      auth.token,
    );
  }

  return { sites: member?.sites || null, error, writeFile };
}
