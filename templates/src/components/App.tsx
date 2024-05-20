import KeyIcon from '~icons/fa6-solid/key';
import EyeIcon from '~icons/fa6-regular/eye';
import PenIcon from '~icons/fa6-solid/pen';
import useStore from '../lib/useStore';
import { Nav } from './Nav';
import NetworksLinks from './NetworksLinks';

import { CurrentPageUrlVisualizer } from './CurrentPageUrlVisualizer';
import { useEffect, useRef } from 'preact/hooks';
import Header from './Header';
import TexturePattern from './TexturePattern';
import PageContentEditor from './PageContentEditor';
import PageContentRenderer from './PageContentEditor/PageContentRenderer';
import { usePatternBackgroundWithOpacity } from '../lib/opacity-background-image';

export default function App() {
  const {
    store: { editing, config },
    selectedPage,
    editorUrl,
    actions: A,
  } = useStore();

  const { hue, saturation, lightness } = config.theme;

  const inEditor = window.location.href.match(/templates\/editor/);

  function handleClickEditToggle(ev: MouseEvent | TouchEvent) {
    if (window.location.href.match(/templates\/editor/)) {
      ev.preventDefault();
      A.toggleEditing();
    }
  }

  const containerRef = useRef<HTMLDivElement>(null);
  usePatternBackgroundWithOpacity(config.theme.pattern, config.theme.patternIntensity, {
    current: document.body,
  });

  // useEffect(() => {
  //   if (containerRef.current) {
  //     // document.body.classList.add
  //   }
  // }, [containerRef.current])

  return (
    <>
      <style>{`:root {
        --main-hue: ${hue};
        --main-saturation: ${saturation}%;
      `}</style>
      <div ref={containerRef} class="relative text-white min-h-screen w-full">
        {editing && <CurrentPageUrlVisualizer />}
        <div class="relative w-full h-full overflow-auto p2 sm:p4 pb-12">
          <div class="absolute top-0 right-0">
            <a
              class="block bg-main-600 hover:bg-main-500 text-white rounded-bl-full h7 w7 p2 text-xs overflow-hidden"
              href={editorUrl}
              onClick={handleClickEditToggle}
              onTouchStart={handleClickEditToggle}
            >
              <div class="relative -top-1">
                {editing ? <EyeIcon /> : inEditor ? <PenIcon /> : <KeyIcon class="-rotate-90" />}
              </div>
            </a>
          </div>
          <Header />
          {selectedPage ? (
            editing ? (
              <PageContentEditor
                key={selectedPage.uuid}
                config={selectedPage}
                onConfigChange={(pageConfig) => A.pages.patch(pageConfig.uuid, pageConfig)}
              />
            ) : (
              <main class="relative max-w-screen-sm mx-auto bg-main-900 rounded-lg px-4 text-black/80">
                <PageContentRenderer elements={selectedPage.elements} />
              </main>
            )
          ) : (
            'Page not found'
          )}
        </div>

        {/* <NetworksLinks /> */}
      </div>
    </>
  );
}
