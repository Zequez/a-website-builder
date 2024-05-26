import useStore from '../lib/useEditorStore';
import { Nav } from './Nav';

export default function Header() {
  const {
    store: { config },
    actions: A,
    selectedPage,
  } = useStore();
  return (
    <header
      class="bg-black/20 max-w-screen-lg mx-auto rounded-lg mb-4 shadow-sm b b-main-400"
      style={{}}
    >
      <div class="relative">
        <h1 class="text-center text-5xl font-black flexcc py4 flex-col sm:flex-row tracking-widest text-white/80">
          {/* <div class="flex-grow"></div> */}
          {config.header.imageUrl ? (
            <img class="max-h-24 max-w-48 mx4 mb4 sm:mb0 rounded-md" src={config.header.imageUrl} />
          ) : null}
          <a
            class=""
            href="/"
            onClick={(ev) => {
              ev.preventDefault();
              A.navigateTo('/');
            }}
          >
            {config.title}
            {config.description ? (
              <p class="font-normal text-xl tracking-wider mt-4">{config.description}</p>
            ) : null}
          </a>
          {/* <div class="flex-grow"></div> */}
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
  );
}
