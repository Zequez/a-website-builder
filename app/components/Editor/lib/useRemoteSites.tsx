import { useEffect, useState, useMemo } from 'preact/hooks';
import { MemberAuth, useAuth } from '@app/components/Auth';
import * as api from '@app/lib/api';
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
    deleted: false,
  };
}

export default function useRemoteSites(auth: MemberAuth | null) {
  const { data: member, error } = api.useRemoteResource(api.getMember, auth?.member?.id, auth);

  const loaded = member !== null;

  const remoteById = useMemo(() => {
    if (member) {
      return keyBy(member?.sites ? member.sites.map(remoteSiteToLocalSite) : [], 'id');
    } else {
      return {};
    }
  }, [member?.sites]);

  const [updatedById, setUpdatedById] = useState<Record<string, LocalSite>>({});

  const _byId = useMemo(() => {
    const resolved = { ...remoteById, ...updatedById };
    for (let id in updatedById) {
      if (updatedById[id].deleted) {
        delete resolved[id];
      }
    }
    return resolved;
  }, [remoteById, updatedById]);

  // const [_byId, setById] = useState<Record<string, LocalSite>>({});

  // useEffect(() => {
  //   const newById = keyBy(member?.sites ? member.sites.map(remoteSiteToLocalSite) : [], 'id');
  //   setById(newById);
  // }, [member?.sites]);

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
      return sites.reduce<{ [key: string]: LocalFile }>((acc, site) => {
        for (let file in site.files) {
          acc[site.files[file].id] = site.files[file];
        }
        return acc;
      }, {});
    } else {
      return {};
    }
  }, [sites]);

  async function putSite(site: LocalSite) {
    if (!auth) return noAuthPromise;
    const { data, error } = await api.putSite(
      {
        id: site.id,
        name: site.name,
        localName: site.localName,
      },
      auth.token,
    );
    if (data) {
      setUpdatedById((byId) => ({ ...byId, [site.id]: site }));
    }
    return { data, error };
  }

  async function postSite(site: LocalSite) {
    if (!auth) return noAuthPromise;
    const { data, error } = await api.postSite(
      { id: site.id, name: site.name, localName: site.localName },
      auth.token,
    );
    if (data) {
      setUpdatedById((byId) => ({ ...byId, [site.id]: site }));
    }
    return { data, error };
  }

  async function deleteSite(site: LocalSite) {
    if (!auth) return noAuthPromise;
    const { data, error } = await api.deleteSite(site, auth.token);
    if (data) {
      setUpdatedById((byId) => ({ ...byId, [site.id]: { ...site, deleted: true } }));
    }
    return { data, error };
  }

  async function putFile(file: { id: string; name: string; content: string }) {
    if (!auth) return noAuthPromise;

    return await api.putFile(
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
    return await api.postFile(
      { name: file.name, data: btoa(file.content), site_id: siteId },
      auth.token,
    );
  }

  async function deleteFile(id: string) {
    if (!auth) return noAuthPromise;
    return await api.deleteFile(id, auth.token);
  }

  return {
    loaded,
    sites: loaded ? sites : null,
    byId,
    _byId,
    allFiles,
    error,
    putFile,
    postFile,
    deleteSite,
    putSite,
    postSite,
    deleteFile,
  };
}
