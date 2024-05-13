import KeyIcon from '~icons/fa6-solid/key';
import useStore from '../lib/useStore';
import { Nav } from './Nav';
import NetworksLinks from './NetworksLinks';
import { CurrentPageUrlVisualizer } from './CurrentPageUrlVisualizer';
import { useEffect } from 'preact/hooks';
import Header from './Header';
import noiseImg from '../assets/noise.png';
import TexturePattern from './TexturePattern';
import PageContentEditor from './PageContentEditor';

export default function App() {
  const {
    store: { editing, config },
    selectedPage,
    editorUrl,
    actions: A,
  } = useStore();

  // useEffect(() => {
  //   const r = document.querySelector(':root')!;
  //   r.style.setProperty('--main-color', '#0F0');
  // }, []);

  const { hue, saturation, lightness } = config.theme;

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
          <Header />
          {selectedPage ? (
            editing ? (
              <PageContentEditor
                config={{ elements: [] }}
                onConfigChange={(newConfig) => console.log('Page config changed')}
              />
            ) : (
              <div class="whitespace-pre-wrap">{selectedPage.content}</div>
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
