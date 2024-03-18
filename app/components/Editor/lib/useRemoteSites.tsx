import { useEffect, useState, useMemo } from 'preact/hooks';
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
import { LocalFile, LocalFiles, LocalSite } from '../types';
import { keyBy } from '@shared/utils';
import { remoteFileToLocalFile } from './utils';

const noAuthPromise = Promise.resolve({
  error: 'Must be logged in for this',
  data: null,
});

function remoteSiteToLocalSite(site: SiteWithFiles): LocalSite {
  return {
    id: site.id,
    name: site.name,
    localName: site.local_name,
    files: keyBy(site.files.map(remoteFileToLocalFile), 'name'),
    updatedAt: new Date(site.updated_at),
  };
}

export default function useRemoteSites(auth: MemberAuth | null) {
  const { data: member, error } = useRemoteResource(apiMember, auth?.member?.id, auth);

  const [_byId, setById] = useState<Record<string, LocalSite>>({});

  useEffect(() => {
    const newById = keyBy(member?.sites ? member.sites.map(remoteSiteToLocalSite) : [], 'id');
    setById(newById);
  }, [member?.sites]);

  const sites = useMemo(() => {
    return Object.values(_byId);
  }, [_byId]);

  function byId(id: string) {
    const found = _byId[id];
    if (!found) {
      throw `No site with id ${id} loaded from remote`;
    }
    return found;
  }

  const allFiles: LocalFiles = useMemo(() => {
    if (sites) {
      return Object.assign({}, ...sites.map((site) => site.files));
    } else {
      return {};
    }
  }, [sites]);

  async function putSite(site: LocalSite) {
    if (!auth) return noAuthPromise;
    const { data, error } = await apiPutSite(
      {
        id: site.id,
        name: site.name,
        localName: site.localName,
      },
      auth.token,
    );
    if (data) {
      setById((byId) => ({ ...byId, [site.id]: site }));
    }
    return { data, error };
  }

  async function publishSite(site: LocalSite) {
    if (!auth) return noAuthPromise;
    const { data, error } = await apiPostSite(
      { id: site.id, name: site.name, localName: site.localName },
      auth.token,
    );
    if (data) {
      setById((byId) => ({ ...byId, [site.id]: site }));
    }
    return { data, error };
  }

  async function deleteSite(site: LocalSite) {
    throw 'Not implemented';
  }

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

  async function postFile(siteId: string, file: { name: string; content: string }) {
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
    sites,
    byId,
    _byId,
    allFiles,
    error,
    putFile,
    postFile,
    deleteSite,
    putSite,
    publishSite,
    deleteFile,
  };
}
