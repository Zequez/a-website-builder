/** @jsxImportSource solid-js */

import CircleInfo from '~icons/fa6-solid/circle-info?raw';
import { Accessor, createEffect, createMemo, createSignal, For, Index, Show } from 'solid-js';
import { cx } from '@app/lib/utils';
import { Pledge, Recipient } from './types';
import { PledgeCard, DraftPledgeCard } from './PledgeCard';

export default function PowerFlow({
  tokens,
  pledges,
  recipients,
  onAdd,
  onUpdatePledge,
}: {
  tokens: number;
  pledges: Accessor<Pledge[]>;
  recipients: Record<string, Recipient>;
  onAdd: () => void;
  onUpdatePledge: (index: number, update: Partial<Pledge>) => void;
}) {
  const allowToAdd = createMemo(
    () => !pledges().find((p) => p.status === 'draft' || p.status === 'committed'),
  );

  return (
    <div class="text-black/60 p-4">
      <InfoPanel />
      <TokensPanel available={tokens - 1000} total={tokens} />
      <Index each={pledges()}>
        {(pledge, i) =>
          pledge().status === 'draft' ? (
            <DraftPledgeCard
              pledge={pledge}
              recipients={recipients}
              onCommit={() => onUpdatePledge(i, { status: 'committed' })}
              onAmountChange={(amount) => onUpdatePledge(i, { amount })}
              onCurrencyChange={(currency) => onUpdatePledge(i, { currency })}
              onModeChange={(mode) => onUpdatePledge(i, { mode })}
            />
          ) : (
            <PledgeCard
              pledge={pledge}
              recipients={recipients}
              onCancel={() => onUpdatePledge(i, { status: 'draft' })}
            />
          )
        }
      </Index>
      <Show when={allowToAdd()}>
        <div class="flexcc">
          <button
            onClick={onAdd}
            class="bg-slate-400 hover:bg-slate-500 rounded-md b b-black/10 text-white px-4 py-2 uppercase tracking-wider font-semibold"
          >
            Add
          </button>
        </div>
      </Show>
    </div>
  );
}

function TokensPanel({ available, total }: { available: number; total: number }) {
  return (
    <div class="flexcc flex-col mb-2">
      <div class="bg-emerald-500 px-8 py-4 b b-black/10 text-white text-shadow-1 rounded-lg text-3xl flex">
        <div class="flexcc flex-col">
          {available.toLocaleString()}
          <div class="text-base text-white/60">Available</div>
        </div>{' '}
        <span class="mx-2">/</span>{' '}
        <div class="flexcc flex-col">
          {total.toLocaleString()}
          <div class="text-base text-white/60">Total</div>
        </div>
      </div>
      <span class="text-2xl text-black/30 font-black uppercase">Tokens</span>
    </div>
  );
}

const DISMISSED_INFO_LS = 'powerFlowDismissedInfo';
const initialDismissedInfo = (localStorage.getItem(DISMISSED_INFO_LS) || 'false') === 'true';
function InfoPanel() {
  const [dismissedInfo, setDismissedInfo] = createSignal(initialDismissedInfo);
  createEffect(() => {
    localStorage.setItem(DISMISSED_INFO_LS, String(dismissedInfo()));
  });

  return (
    <div class="relative">
      {/* <div class={cx('relative z-20 h-0')}> */}
      <div
        onClick={() => setDismissedInfo((v) => !v)}
        class={cx(
          'text-slate-500 z-20 w-10 h-10 flexss text-2xl absolute h-8 w-8 -top-2 cursor-pointer transition-500 transition-property-all',
          {
            'right-0 translate-x-0': dismissedInfo(),
            'right-1/2 translate-x-1/2': !dismissedInfo(),
          },
        )}
        innerHTML={CircleInfo as unknown as string}
      />
      {/* </div> */}
      <Show when={!dismissedInfo()}>
        <div class="pt-2">
          <div class="relative mb-4 text-black/40 bg-slate-200 b b-slate-300 rounded-md p-4">
            <p class="mb-2">
              Here you can manage the money you pledged to the space and add new pledges.
            </p>
            <ul class="pl-4">
              <li>&rarr; There can be multiple recipients for a single pledge.</li>
              <li>&rarr; Pledges can be one-time or recurring.</li>
              <li>&rarr; Transactions are handled using Gumroad for USD or MercadoPago for ARS.</li>
              <li>
                &rarr; The money you add is converted to tokens that are used to signal proposals.
              </li>
              <li>&rarr; Each teams is responsibly for administrating the money received.</li>
            </ul>
            <div class="flexee">
              <button class="underline hover:text-black/60" onClick={() => setDismissedInfo(true)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
