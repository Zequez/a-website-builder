import { render } from 'preact';
import { useState, useEffect, useMemo, useRef } from 'preact/hooks';

import KeyIcon from '~icons/fa6-solid/key';
import { cx } from '@shared/utils';
import indexHtml from '../../index.html?raw';
import createValidator from '../config-validator';
import useStore, { StoreContextWrapper } from '../lib/useStore';
import { Nav } from './Nav';
import NetworksLinks from './NetworksLinks';

export default function App() {
  const {
    store: { editing, config },
    configChanged,
    selectedPage,
    actions: A,
  } = useStore();

  return (
    <>
      <div class="relative overflow-auto bg-emerald-600 text-white min-h-screen w-full">
        <div class="relative flex_s flex-col w-full h-full overflow-auto p-4 pb-12">
          <div class="absolute top-0 right-0">
            {!editing ? (
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
            <div class="relative">
              <h1 class="text-center text-3xl sm:text-5xl font-black h-40 flexcc tracking-widest text-white/80">
                <a href="/">{config.title}</a>
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
        </div>

        <NetworksLinks />
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
