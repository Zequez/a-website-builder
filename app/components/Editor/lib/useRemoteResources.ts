import { MemberAuth } from '@app/components/Auth';
import { useRemoteResource, ApiEndpoint } from '@app/lib/api';
import * as api from '@app/lib/api';
import { keyBy } from '@shared/utils';
import { useEffect, useMemo, useState } from 'preact/hooks';

// type ApiEndpoint<T, K> = (params: T, auth: string) => TypedSimplifiedResponse<K>;

type BaseResourceType = { id: string; deleted: boolean };
type BaseParamType = { id: string };

type UseRemoteResourcesConfig<ApiParams, ApiData, T> = {
  // undefined = Endpoint does not require auth
  // null = Not authenticated
  auth: MemberAuth | null | undefined;
  fetchEndpoint: ApiEndpoint<ApiParams, ApiData>;
  parseRemoteData: (data: ApiData) => T[];
  fetchParams: null | ApiParams;
  postEndpoint: ApiEndpoint<T, any>;
  putEndpoint: ApiEndpoint<T, any>;
  deleteEndpoint: ApiEndpoint<T, any>;
};

export default function useRemoteResources<ApiParams, ApiData, T extends BaseResourceType>(
  config: UseRemoteResourcesConfig<ApiParams, ApiData, T>,
) {
  const { auth, fetchEndpoint, fetchParams, parseRemoteData } = config;
  const authRequired = typeof auth !== 'undefined';

  const { data: remoteResource, error } = useRemoteResource<ApiParams, ApiData>(
    fetchEndpoint,
    fetchParams,
    auth,
  );

  const loaded = remoteResource !== null;

  const parsedResources = useMemo(() => {
    if (remoteResource) {
      return parseRemoteData(remoteResource);
    } else {
      return null;
    }
  }, [remoteResource]);

  const remoteById = useMemo(() => {
    if (parsedResources) {
      const byId: { [key: string]: T } = {};
      for (let parsedResource of parsedResources) {
        byId[parsedResource.id] = parsedResource;
      }
      return byId;
    } else {
      return null;
    }
  }, [parsedResources]);

  const [updatedById, setUpdatedById] = useState<Record<string, T>>({});

  const byId = useMemo(() => {
    if (!remoteById) return null;
    const resolved = { ...remoteById, ...updatedById };
    for (let id in updatedById) {
      if (updatedById[id].deleted) {
        delete resolved[id];
      }
    }
    return resolved;
  }, [remoteById, updatedById]);

  const list = useMemo(() => {
    if (byId) {
      return Object.values(byId);
    } else {
      return null;
    }
  }, [byId]);

  async function post(item: T) {
    if (!auth && authRequired) return noAuthPromise;
    const { data, error } = await config.postEndpoint(item, auth?.token);
    if (data) {
      setUpdatedById((byId) => ({ ...byId, [item.id]: item }));
    }
    return { data, error };
  }

  async function put(item: T) {
    if (!auth && authRequired) return noAuthPromise;
    const { data, error } = await config.putEndpoint(item, auth?.token);
    if (data) {
      setUpdatedById((byId) => ({ ...byId, [item.id]: item }));
    }
    return { data, error };
  }

  async function delete_(item: T) {
    if (!auth && authRequired) return noAuthPromise;
    const { data, error } = await config.deleteEndpoint(item, auth?.token);
    if (data) {
      setUpdatedById((byId) => ({ ...byId, [item.id]: { ...item, deleted: true } }));
    }
    return { data, error };
  }

  return {
    list,
    _byId: byId,
    byId: (id: string) => {
      if (byId && byId[id]) {
        return byId[id];
      } else {
        throw `No item ${id} loaded from remote`;
      }
    },
    post,
    put,
    delete: delete_,
    error,
    loaded,
  };
}

const noAuthPromise = Promise.resolve({
  error: 'Must be logged in for this',
  data: null,
});
