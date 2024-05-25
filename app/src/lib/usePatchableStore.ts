import { useRef, useState } from 'preact/hooks';

export function usePatchableStore<T>(init: T | (() => T)) {
  const [store, setStore] = useState<T>(init);

  const withholdPatches = useRef(false);
  const patchTransaction = useRef<(Partial<T> | ((currentStore: T) => Partial<T>))[]>([]);

  function beginTransaction() {
    withholdPatches.current = true;
  }

  function endTransaction() {
    withholdPatches.current = false;
    setStore((currentStore) => {
      let finalPatch = {};
      for (let patch of patchTransaction.current) {
        finalPatch = {
          ...finalPatch,
          ...(typeof patch === 'function' ? patch(currentStore) : patch),
        };
      }

      return { ...currentStore, ...finalPatch };
    });
  }

  function patchStore(patch: Partial<T> | ((currentStore: T) => Partial<T>)) {
    if (withholdPatches.current) {
      patchTransaction.current.push(patch);
      return;
    }
    setStore((currentStore) => ({
      ...currentStore,
      ...(typeof patch === 'function' ? patch(currentStore) : patch),
    }));
  }

  return { store, setStore, patchStore, beginTransaction, endTransaction };
}
