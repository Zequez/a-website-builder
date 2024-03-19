import { useMemo, useState } from 'preact/hooks';

type UseLocalResourceConfig = {
  localStoragePrefix: string;
  localStorage?: typeof localStorage;
};
type ResourceType = {
  id: string;
  updatedAt: Date;
  deleted: boolean;
};
export default function useLocalResources<T extends ResourceType>(config: UseLocalResourceConfig) {
  const PREFIX = config.localStoragePrefix;
  const LS = config.localStorage || window.localStorage;

  const KLS = {
    getItem(key: string) {
      return LS.getItem(`${PREFIX}${key}`);
    },
    setItem(key: string, value: string) {
      LS.setItem(`${PREFIX}${key}`, value);
    },
    removeItem(key: string) {
      LS.removeItem(`${PREFIX}${key}`);
    },
  };

  const [byId, setById] = useState<{ [key: string]: T }>(() => {
    const items: { [key: string]: T } = {};
    Object.keys(LS)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => {
        let id = key.slice(PREFIX.length);
        try {
          const item = JSON.parse(LS.getItem(key)!);
          if (item.id !== id) {
            console.warn('Item ID missmatch; renaming');
            KLS.setItem(item.id, JSON.stringify(item));
            KLS.removeItem(id);
            id = item.id;
          }
          item.updatedAt = new Date(item.updatedAt);
          item.deleted = typeof item.deleted === 'undefined' ? false : item.deleted;
          items[id] = item;
        } catch (e) {
          console.error(`Invalid item on localstorage ${key}; removing`);
          KLS.removeItem(id);
        }
      });
    return items;
  });

  function update(id: string, update: Partial<T>) {
    const item = byId[id];
    return set({ ...item, ...update, updatedAt: new Date() });
  }

  function set(item: T) {
    setById((byId) => ({ ...byId, [item.id]: item }));
    KLS.setItem(item.id, JSON.stringify(item));
    return item;
  }

  function remove(id: string) {
    KLS.removeItem(id);
    setById((byId) => {
      const newById = { ...byId };
      delete newById[id];
      return newById;
    });
  }

  const list = useMemo(() => Object.values(byId), [byId]) as T[];

  return { byId, _byId: byId, list, update, set, remove };
}
