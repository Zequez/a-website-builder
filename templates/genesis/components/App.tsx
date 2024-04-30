import { render } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import indexHtml from '../index.html?raw';
import createValidator from '../config-validator';
import useStore from '../lib/useStore';

export default function App(p: { initialConfig: Config }) {
  const { store, configChanged, actions: A } = useStore(p.initialConfig);

  function saveConfig() {
    A.saveConfig();
    console.log(toHtml(store.config));
  }

  return (
    <div class="flexcc flex-col p-4">
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

export function toHtml(config: Config) {
  const validator = createValidator();
  if (!validator(config)) {
    console.log(validator.errors);
    return null;
  }

  const div = document.createElement('div');
  render(<App initialConfig={config} />, div);
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
