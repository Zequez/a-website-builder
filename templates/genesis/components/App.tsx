import { render } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';

import KeyIcon from '~icons/fa6-solid/key';
import { cx } from '@shared/utils';
import indexHtml from '../../index.html?raw';
import createValidator from '../config-validator';
import useStore, { StoreContextWrapper } from '../lib/useStore';
import { Nav } from './Nav';
import NetworksLinks from './NetworksLinks';
import { CurrentPageUrlVisualizer } from './CurrentPageUrlVisualizer';
import urlHash from '../lib/urlHash';

export default function App() {
  const {
    store: { editing, config, siteId },
    pathname,
    configChanged,
    selectedPage,
    editorUrl,
    actions: A,
  } = useStore();

  // const appRenderedContext = import.meta.env.DEV
  //   ? editing
  //     ? 'dev-editor'
  //     : 'dev-app'
  //   : location.port === '3000'
  //     ? editing
  //       ? 'dev-server-editor'
  //       : 'dev-server-app'
  //     : editing
  //       ? 'prod-editor'
  //       : 'prod-app';

  return (
    <>
      <div class="relative overflow-auto bg-emerald-600 text-white min-h-screen w-full">
        {editing && <CurrentPageUrlVisualizer />}
        <div class="relative w-full h-full overflow-auto p-4 pb-12">
          <div class="absolute top-0 right-0">
            {!editing ? (
              <a
                class="block bg-emerald-500 hover:bg-emerald-300 text-white rounded-bl-full h7 w7 p2 text-xs overflow-hidden"
                href={editorUrl}
              >
                <div class="relative -top-1">
                  <KeyIcon class="-rotate-90" />
                </div>
              </a>
            ) : null}
          </div>
          <header class="bg-emerald-300 max-w-screen-lg rounded-lg mb-4 shadow-sm">
            <div class="relative">
              <h1 class="text-center text-3xl sm:text-5xl font-black h-40 flexcc tracking-widest text-white/80">
                <a
                  href="/"
                  onClick={(ev) => {
                    ev.preventDefault();
                    A.navigateTo('/');
                  }}
                >
                  {config.title}
                </a>
              </h1>
              {!!(selectedPage && !selectedPage.onNav) && (
                <div class="absolute bottom-2 left-2 bg-black/20 rounded-md px1 py0.5">
                  <span class="mr-2">{selectedPage.icon}</span>
                  {selectedPage.title}
                </div>
              )}
            </div>
            <Nav />
          </header>
          <main class="max-w-screen-sm mx-auto bg-white/70 rounded-lg p-4 text-black/60">
            {selectedPage ? (
              editing ? (
                <PageContentEditor
                  content={selectedPage.content}
                  onChange={(v) => A.pages.patch(selectedPage.uuid, { content: v })}
                />
              ) : (
                selectedPage.content
              )
            ) : (
              'Page not found'
            )}
          </main>
        </div>

        <NetworksLinks />
      </div>
    </>
  );
}

function PageContentEditor(p: { content: string; onChange: (content: string) => void }) {
  return (
    <textarea
      class="block w-full rounded-md bg-white/20 p2"
      value={p.content}
      onChange={({ currentTarget }) => p.onChange(currentTarget.value)}
    />
  );
}
