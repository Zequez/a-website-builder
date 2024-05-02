import { render } from 'preact';
import { useState, useEffect, useMemo, useRef } from 'preact/hooks';
import InstagramIcon from '~icons/fa6-brands/instagram';
import FacebookIcon from '~icons/fa6-brands/facebook';
import WhatsappIcon from '~icons/fa6-brands/whatsapp';
import TelegramIcon from '~icons/fa6-brands/telegram';
import PencilIcon from '~icons/fa6-solid/pencil';
import CheckIcon from '~icons/fa6-solid/check';
import VGripLinesIcon from '~icons/fa6-solid/grip-lines-vertical';
import cx from 'classnames';
import indexHtml from '../../index.html?raw';
import createValidator from '../config-validator';
import useStore, { StoreContextWrapper } from '../lib/useStore';

export default function App() {
  const { store, configChanged, actions: A } = useStore();

  function saveConfig() {
    A.saveConfig();
    console.log(toHtml(store.config));
  }

  const pages = store.config.pages;

  return (
    <div class="bg-emerald-600 text-white min-h-screen flex_s flex-col p-4">
      <div class="absolute top-2 right-2">
        <button
          class="bg-emerald-500 text-white rounded-full p2"
          onClick={() => (!store.editing ? A.startEditing() : A.finishEditing())}
        >
          {store.editing ? <CheckIcon /> : <PencilIcon />}
        </button>
      </div>
      <header class="bg-emerald-300 max-w-screen-lg rounded-lg mb-4 shadow-sm">
        <h1 class="text-center text-3xl sm:text-5xl font-black mb4 h-40 flexcc tracking-widest text-white/80">
          <a href="/">Ezequiel Inventos</a>
        </h1>
        <Nav />
      </header>
      <div class="fixed w-full left-0 bottom-0 flexcc bg-black/50 space-x-4 px-4 flex-wrap py2">
        <a class="flexcc">
          <InstagramIcon class="mr-2" /> ezequiel.inventos
        </a>
        <a class="flexcc">
          <FacebookIcon class="mr-2" /> Ezequiel
        </a>
        <a class="flexcc">
          <WhatsappIcon class="mr-2 " /> 2235235568 <TelegramIcon class="ml-2" />
        </a>
      </div>
      <div class="flexcc mb4">
        <div class="mr4">Page title:</div>
        <input
          class="px2 py1 rounded-md text-black text-lg"
          value={store.config.title}
          onInput={(e) => A.setConfigVal('title', e.currentTarget.value)}
        />
      </div>
      <button
        class="bg-slate-400 rounded-md px-2 py-1 mb4"
        onClick={() => A.setConfigVal('foo', !store.config.foo)}
      >
        Foo: {store.config.foo ? 'TRUE' : 'FALSE'}
      </button>
      <button
        class="bg-emerald-400 rounded-md px-2 py-1 disabled:saturate-0"
        onClick={saveConfig}
        disabled={!configChanged}
      >
        Save changes
      </button>
    </div>
  );
}

// function SocialItem ({ href, children }: { href: string; children: any }) {

// }

function Nav() {
  const {
    store: {
      editing,
      config: { pages },
    },
    actions: A,
  } = useStore();

  const [isDragging, setIsDragging] = useState(false);

  function handleDragStart() {}

  function handleDragEnd() {}

  function handleDragMove() {}

  return (
    <nav class="bg-white/30 rounded-b-lg flexcc flex-wrap text-xl sm:text-2xl space-x-1">
      {pages.map(({ path, title }) => (
        <div class="flex">
          <NavItem
            active={path === '/'}
            path={path}
            onChange={(newTitle, newPath) => {
              A.patchPage(path, { title: newTitle, path: newPath });
            }}
            title={title}
          />
          {editing ? (
            <div class="relative z-20 text-base top-0 bg-gray-300 text-black/40 h-12 flexcc rounded-r-md cursor-ew-resize">
              <VGripLinesIcon class="-mx-0.5" />
            </div>
          ) : null}
        </div>
      ))}
    </nav>
  );
}

function NavItem(p: {
  path: string;
  title: string;
  active?: boolean;
  onChange: (title: string, path: string) => void;
}) {
  const {
    store: { editing: globalEditing },
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const el = useRef<HTMLSpanElement>(null);
  const elHref = useRef<HTMLInputElement>(null);

  function startEditing(ev: MouseEvent) {
    ev.preventDefault();
    setIsEditing(true);

    if (el.current) {
      setTimeout(() => {
        el.current!.focus();
        const range = document.createRange();
        range.selectNodeContents(el.current!);
        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);
      }, 100);
    }
  }

  function confirmChange() {
    if (isEditing) {
      const newTitle = el.current!.textContent || '';
      const newPath = '/' + elHref.current!.value;
      p.onChange(newTitle, newPath);
      setIsEditing(false);
      el.current!.blur();
    }
  }

  function handlePressEnter(ev: KeyboardEvent) {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      confirmChange();
    }
  }

  return (
    <a
      class={cx(
        'relative px3 sm:px4 py1 sm:py2 -mt1 -mb1 rounded-lg flexcc text-black/40 font-light hover:z-30',
        {
          'bg-emerald-500 text-white  shadow-md': p.active,
          'hover:bg-white/40': !p.active,
        },
      )}
      onClick={(ev) => {
        if (isEditing) {
          ev.preventDefault();
        }
      }}
      href={p.path}
    >
      <span
        ref={el}
        tabIndex={isEditing ? 0 : -1}
        contentEditable={isEditing}
        onKeyPress={handlePressEnter}
        class={cx({
          'bg-white/20': isEditing,
        })}
      >
        {p.title}
      </span>
      {isEditing ? (
        <>
          <div class="absolute top-[100%] left-0 mt-1">
            <div class="flex">
              <span class="text-black/60 bg-gray-200 rounded-md mr-2 px-2 font-bold">/</span>
              <input
                type="text"
                ref={elHref}
                onKeyPress={handlePressEnter}
                class=" w-40 rounded-md px-2 text-black/60"
                value={p.path.replace(/^\//, '')}
              />
            </div>
            <div class="flexee">
              <button
                class="text-lg px-2 py-1 rounded-md mt-1 bg-emerald-500 hover:bg-emerald-400"
                onClick={(ev) => {
                  ev.preventDefault();
                  confirmChange();
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </>
      ) : null}
      {globalEditing ? (
        <button
          class="rounded-full bg-white/20 hover:bg-white hover:text-black/60 h-8 w-8 ml-2 text-sm flexcc"
          onClick={startEditing}
        >
          <PencilIcon />
        </button>
      ) : null}
    </a>
  );
}

export function toHtml(config: Config) {
  const validator = createValidator();
  if (!validator(config)) {
    console.log(validator.errors);
    return null;
  }

  const div = document.createElement('div');
  render(
    <StoreContextWrapper initialConfig={config}>
      <App />
    </StoreContextWrapper>,
    div,
  );
  const preRendered = div.innerHTML;
  render(null, div);

  const preRenderedIndex = indexHtml
    .replace(`<div id="root">`, `<div id="root">${preRendered}`)
    .replace(
      `<script id="config" type="application/json">`,
      `<script id="config" type="application/json">${JSON.stringify(config)}`,
    )
    .replace(`<title>(.*?)</title>`, `<title>${config.title}</title>`);

  // const root2 = document.getElementById('root2')!;
  // root2.innerHTML = preRendered;

  // hydrate(<App initialConfig={config} />, root2);

  return preRenderedIndex;
}
