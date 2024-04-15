/** @jsxImportSource solid-js */

import { createEffect, createSignal } from 'solid-js';
import solidWrapper from './solidWrapper';

export function PowerFlow() {
  console.log('SETTING UP stst stst stst');
  const [count, setCount] = createSignal(1);
  const doubledCount = () => 2 * count();

  createEffect(() => {
    // render some stuff based on `b`
    console.log('Counting', count());
  });

  return (
    <button
      class="bg-red-400 p-4"
      onClick={() => {
        console.log('mmmm', count());
        setCount((prev) => prev + 1);
      }}
    >
      Adddd {count()}-{doubledCount()}
    </button>
  );
}

// render(() => <PowerFlow />, document.getElementById('solid-root')!);

const { render, Component } = solidWrapper(PowerFlow);

export default Component;
if (import.meta.hot) {
  import.meta.hot.data.render ||= render;
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      import.meta.hot!.data.render(newModule.PowerFlow);
    }
  });
}
