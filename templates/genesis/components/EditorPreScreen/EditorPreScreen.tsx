import { useEffect, useState } from 'preact/hooks';
import useStore from '../../lib/useStore';
import ConfigurationFixer from './ConfigurationFixer';
import Loading from './Loading';
import Access from './Access';

export default function EditorPreScreen() {
  const {
    store: { invalidConfig, accessKeyToken },
  } = useStore();

  return (
    <div class="h-screen w-screen bg-emerald-500 text-white p-4">
      {!accessKeyToken ? (
        <Access />
      ) : invalidConfig ? (
        <ConfigurationFixer config={invalidConfig} />
      ) : (
        <Loading />
      )}
    </div>
  );
}
