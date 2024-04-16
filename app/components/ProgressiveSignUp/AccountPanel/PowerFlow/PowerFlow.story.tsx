/** @jsxImportSource solid-js */

import { createEffect, createSignal } from 'solid-js';
import { Part, createStore } from 'solid-js/store';
import PowerFlow from './PowerFlow';
import { Recipient, Pledge } from './types';
import solidWrapper from '../solidWrapper';

type Store = {
  pledges: Pledge[];
  // recipients: Record<string, Recipient>;
  // tokens: number;
};

function PowerFlowStory() {
  const [recipients, setRecipients] = createSignal<Record<string, Recipient>>({
    hoja: {
      name: 'Hoja Team',
      proposals: [],
    },
    tizasEnLasPlazas: {
      name: 'Tizas en las Plazas Team',
      proposals: [],
    },
  });

  const [store, setStore] = createStore<Store>({
    pledges: [
      {
        amount: 25,
        currency: 'USD',
        completedAt: null,
        mode: 'recurring-month',
        status: 'active',
        nextRenew: new Date('2024-1-26'),
        towards: {
          hoja: 0.8,
          tizasEnLasPlazas: 0.2,
        },
        historic: [
          ['26 Dec 2023', 25],
          ['26 Nov 2023', 25],
        ],
      },
      {
        amount: 12000,
        currency: 'ARS',
        completedAt: new Date('2023-12-25'),
        mode: 'onetime',
        status: 'done',
        nextRenew: null,
        towards: {
          hoja: 1,
        },
        historic: [],
      },
      // {
      //   amount: 1000,
      //   currency: 'ARS',
      //   completedAt: null,
      //   mode: 'onetime',
      //   status: 'draft',
      //   nextRenew: null,
      //   towards: {
      //     hoja: 1,
      //   },
      //   historic: [],
      // },
    ],
  });

  const tokens = 6200;

  function handleAddPledge() {
    setStore('pledges', store.pledges.length, {
      amount: 1000,
      currency: 'ARS',
      completedAt: null,
      mode: 'onetime',
      status: 'draft',
      nextRenew: null,
      towards: {
        hoja: 1,
      },
      historic: [],
    });
  }

  function updateWith(i: number, update: Partial<Pledge>) {
    console.log('Updating pledge', i, update);
    setStore('pledges', i, update);
    // for (let k in update) {
    //   const key = k as keyof typeof update;
    //   console.log(key, update[key]);

    // }

    // setPledges((prev) => {
    //   return prev.map((pledge, j) => (j === i ? { ...pledge, ...update } : pledge));
    // });
  }

  // createEffect(() => {
  //   for (let pledge of store.pledges) {
  //     console.log(pledge);
  //   }
  // });

  return (
    <PowerFlow
      recipients={recipients()}
      pledges={store.pledges}
      tokens={tokens}
      onAdd={handleAddPledge}
      onUpdatePledge={updateWith}
    />
  );
}

const { render, Component } = solidWrapper(PowerFlowStory);

export default Component;
if (import.meta.hot) {
  import.meta.hot.data.render ||= render;
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      import.meta.hot!.data.render(newModule.PowerFlow);
    }
  });
}
