import { useEffect, useState } from 'preact/hooks';
import useStore from '../../lib/useStore';
import ConfigurationFixer from './ConfigurationFixer';
import Loading from './Loading';
import Access from './Access';

export default function EditorPreScreen() {
  const {
    store: { invalidConfig, accessToken, siteId },
  } = useStore();

  return (
    <div class="h-screen bg-emerald-500 text-white p-4 overflow-auto">
      {!accessToken ? (
        <Access />
      ) : invalidConfig && siteId ? (
        <ConfigurationFixer
          accessToken={accessToken}
          siteId={siteId}
          unknownConfig={invalidConfig}
        />
      ) : (
        <Loading />
      )}
    </div>
  );
}
