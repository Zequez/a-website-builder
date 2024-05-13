import KeyIcon from '~icons/fa6-solid/key';
import EyeIcon from '~icons/fa6-regular/eye';
import PenIcon from '~icons/fa6-solid/pen';
import useStore from '../lib/useStore';
import { Nav } from './Nav';
import NetworksLinks from './NetworksLinks';
import { CurrentPageUrlVisualizer } from './CurrentPageUrlVisualizer';
import { useEffect } from 'preact/hooks';
import Header from './Header';
import noiseImg from '../assets/noise.png';
import TexturePattern from './TexturePattern';
import PageContentEditor from './PageContentEditor';
import PageElementsRenderer from './PageContentEditor/PageElementsRenderer';

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

  return (
    <>
      <style>{`:root {
        --main-hue: ${hue};
        --main-saturation: ${saturation}%;
      `}</style>
      <div class="relative overflow-auto bg-main-500 text-white min-h-screen w-full">
        {editing && <CurrentPageUrlVisualizer />}
        <TexturePattern />
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
                <PageElementsRenderer elements={selectedPage.elements} />
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
