import { render } from 'preact';
import { useState, useEffect, useMemo, useRef } from 'preact/hooks';
import InstagramIcon from '~icons/fa6-brands/instagram';
import FacebookIcon from '~icons/fa6-brands/facebook';
import WhatsappIcon from '~icons/fa6-brands/whatsapp';
import TelegramIcon from '~icons/fa6-brands/telegram';
import PencilIcon from '~icons/fa6-solid/pencil';
import CheckIcon from '~icons/fa6-solid/check';
import GearIcon from '~icons/fa6-solid/gear';
import KeyIcon from '~icons/fa6-solid/key';
import { cx } from '@shared/utils';
import indexHtml from '../../index.html?raw';
import createValidator from '../config-validator';
import useStore, { StoreContextWrapper } from '../lib/useStore';
import { Nav } from './Nav';

export default function App() {
  const { store, configChanged, actions: A } = useStore();

  return (
    <>
      {store.editing && <div></div>}
      {store.editing && (
        <div class="fixed h-screen w-80 z-40 right-0 pointer-events-none overflow-hidden">
          <div
            class={cx(
              'absolute h-full z-30 w-60 right-0 bg-emerald-700 b-l-2 shadow-md b-l-black text-white p4 transition-transform pointer-events-auto',
              {
                'translate-x-full': !store.settingsMenuOpen,
              },
            )}
          >
            <div class="text-center text-xl">Configuración</div>
            <div class="absolute top-0 right-full pr-2 pt-2 flex flex-col space-y-2 pointer-events-auto">
              <button
                onClick={A.toggleSettingsMenu}
                class="bg-emerald-500 hover:bg-emerald-300 text-white rounded-full p2"
              >
                <GearIcon />
              </button>
              <button
                class="bg-emerald-500 hover:bg-emerald-300 text-white rounded-full p2"
                onClick={A.finishEditing}
              >
                <CheckIcon />
              </button>
            </div>
          </div>
        </div>
      )}
      <div class="relative overflow-auto bg-emerald-600 text-white min-h-screen w-full">
        <div class="relative flex_s flex-col w-full h-full overflow-auto p-4 pb-12">
          <div class="absolute top-0 right-0">
            {!store.editing ? (
              <a
                class="block bg-emerald-500 hover:bg-emerald-300 text-white rounded-bl-full h7 w7 p2 text-xs overflow-hidden"
                href="/templates/editor#fbd06659-405d-44a5-81c6-cd037031bbf6"
              >
                <div class="relative -top-1">
                  <KeyIcon class="-rotate-90" />
                </div>
              </a>
            ) : null}
          </div>
          <header class="bg-emerald-300 max-w-screen-lg rounded-lg mb-4 shadow-sm">
            <h1 class="text-center text-3xl sm:text-5xl font-black mb4 h-40 flexcc tracking-widest text-white/80">
              <a href="/">{store.config.title}</a>
            </h1>
            <Nav />
          </header>
        </div>

        <div class="absolute w-full left-0 bottom-0 flexcc bg-black/50 space-x-4 px-4 flex-wrap py2">
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
      </div>
    </>
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
    <StoreContextWrapper initialConfig={config} siteId={null} editing={false}>
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
