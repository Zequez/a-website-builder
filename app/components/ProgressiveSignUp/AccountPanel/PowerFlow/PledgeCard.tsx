/** @jsxImportSource solid-js */

import OutLink from '~icons/fa6-solid/up-right-from-square?raw';
import { Accessor, For, Match, Show, Switch } from 'solid-js';
import { strToHue } from '@app/lib/utils';
import {
  PledgeMode,
  PledgeCurrency,
  PledgeStatus,
  Pledge,
  Recipient,
  CURRENCY_LIST,
  MODES_LIST,
  STATUS_LIST,
} from './types';
import { paymentLinks, directPayments } from './config';

function pledgeTotal(pledge: Pledge) {
  return pledge.historic.reduce((all, [date, amount]) => {
    return all + amount;
  }, 0);
}

function isRecurring(mode: Pledge['mode']) {
  return mode === 'monthly' || mode === 'yearly';
}

const getManageButtonData = (pledge: Pledge) => {
  if (pledge.currency === 'ars') {
    return { url: 'https://www.mercadopago.com.ar/subscriptions', label: 'Manage on MercadoPago' };
  } else {
    return { url: 'https://gumroad.com', label: 'Manage on Gumroad' };
  }
};

export function PledgeCard(p: {
  pledge: Pledge;
  recipients: Record<string, Recipient>;
  onCancel: () => void;
}) {
  return (
    <div class="bg-slate-200 b b-slate-300 rounded-md mb-4 last:mb-0">
      <div class="p-4">
        <div class="flexss mb-4">
          <div class="flex-grow">
            <div class="text-2xl text-black/40">
              <span class="font-black mr-2">{p.pledge.amount.toLocaleString()}</span>
              <span class="">
                <span class="uppercase">{p.pledge.currency}</span>
                <Switch>
                  <Match when={p.pledge.mode === 'yearly'}> / year</Match>
                  <Match when={p.pledge.mode === 'monthly'}> / month</Match>
                </Switch>
              </span>
            </div>
            <Show
              when={
                p.pledge.mode.startsWith('recurring') &&
                p.pledge.nextRenew &&
                p.pledge.status === 'active'
              }
            >
              <div class="text-black/40">
                Next renew on {p.pledge.nextRenew?.toISOString().slice(0, 10)}
              </div>
            </Show>
          </div>
          <StatusBadge status={p.pledge.status} />
        </div>
        <RecipientsBar recipients={p.recipients} pledge={p.pledge} />
      </div>
      <Show when={p.pledge.historic.length}>
        <div class="px-4 mb-4">
          <div class="bg-slate-400 text-white rounded-md overflow-hidden">
            <For each={p.pledge.historic}>
              {([date, amount], i) => (
                <div class="flex px-2 py-1 b-b b-slate-500">
                  <div class="flex-grow">{date}</div>
                  <div class="">
                    {amount.toLocaleString()} {p.pledge.currency.toUpperCase()}
                  </div>
                </div>
              )}
            </For>
            <div class="bg-slate-500 px-2 py-1 text-right text-white/75">
              <span class="tracking-wider">TOTAL:</span>{' '}
              <span class="font-black">
                {pledgeTotal(p.pledge)} {p.pledge.currency.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </Show>
      <Show when={p.pledge.status === 'committed'}>
        <div class="px-4 mb-4 text-white">
          <div class="bg-amber-400/70 p-4 rounded-md b b-black/10 text-center">
            Your pledge is comitted. Awaiting payment signal. <br />
            Make sure you select the comitted amount.
            <Button
              class="mt-2"
              href={paymentLinks[p.pledge.currency][p.pledge.mode].label}
              target="_blank"
            >
              Pay on {paymentLinks[p.pledge.currency][p.pledge.mode].label}
            </Button>
            <Show when={!!(directPayments as any)[p.pledge.currency]?.[p.pledge.mode]}>
              <div class="mt-2">{(directPayments as any)[p.pledge.currency][p.pledge.mode]}</div>
            </Show>
          </div>
        </div>
        <div class="px-4 mb-4 flexee">
          <div class="flex-grow"></div>
          <Button onClick={p.onCancel}>Un-commit</Button>
        </div>
      </Show>
      <Show when={isRecurring(p.pledge.mode)}>
        <div class="flexee px-4 mb-4">
          <ManageButton {...getManageButtonData(p.pledge)} />
        </div>
      </Show>
    </div>
  );
}

const modeLabels: { [key in PledgeMode]: string } = {
  monthly: 'Monthly',
  yearly: 'Yearly',
  onetime: 'One-time',
};

export function DraftPledgeCard(p: {
  pledge: Pledge;
  recipients: Record<string, Recipient>;
  onCommit: () => void;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: Pledge['currency']) => void;
  onModeChange: (mode: Pledge['mode']) => void;
}) {
  return (
    <div class="bg-slate-200 b b-slate-300 rounded-md mb-4 last:mb-0">
      <div class="p-4">
        <div class="flexss mb-4">
          <div class="flex-grow mr-2">
            <div class="flex flex-col xs:flex-row text-base sm:text-2xl text-black/40 space-y-2 xs:space-y-0 xs:space-x-2">
              <input
                class="rounded-md w-full h-8 xs:h-10 text-center sm:px-2 sm:py-1"
                type="number"
                value={p.pledge.amount}
                onInput={({ currentTarget }) => {
                  p.onAmountChange(parseInt(currentTarget.value));
                }}
              />
              <select
                value={p.pledge.currency}
                onChange={({ currentTarget }) =>
                  p.onCurrencyChange(currentTarget.value as Pledge['currency'])
                }
                class="rounded-md w-full h-8 xs:h-10 sm:px-2 sm:py-1 text-center"
              >
                <For each={CURRENCY_LIST}>
                  {(currency) => <option value={currency}>{currency.toUpperCase()}</option>}
                </For>
              </select>
              <select
                value={p.pledge.mode}
                class="rounded-md w-full sm:w-30 sm:px-2 sm:py-1 h-8 xs:h-10 text-center"
                onChange={({ currentTarget }) => {
                  p.onModeChange(currentTarget.value as Pledge['mode']);
                }}
              >
                <For each={MODES_LIST}>
                  {(mode) => <option value={mode}>{modeLabels[mode]}</option>}
                </For>
              </select>
            </div>
          </div>
          <StatusBadge status={p.pledge.status} />
        </div>
      </div>
      <div class="flexee px-4 mb-4">
        <div class="flex-grow text-black/40">Recipient: Hoja team (the only team for now)</div>
        <Button disabled={!p.pledge.amount} onClick={p.onCommit}>
          Commit
        </Button>
      </div>
    </div>
  );
}

function Button(p: {
  href?: string;
  target?: string;
  onClick?: () => void;
  children: any;
  disabled?: boolean;
  class?: string;
}) {
  const _class = `flexcc px-2 py-1 bg-slate-400 b b-black/10 rounded-md text-white/90 cursor-pointer ${p.class}`;
  const classList = () => ({
    'opacity-50 cursor-not-allowed': p.disabled,
    'hover:bg-slate-500': !p.disabled,
  });
  return p.href ? (
    <a class={_class} classList={classList()} href={p.href} target={p.target}>
      {p.children}
    </a>
  ) : (
    <button class={_class} disabled={p.disabled} classList={classList()} onClick={p.onClick}>
      {p.children}
    </button>
  );
}

function StatusBadge({ status }: { status: Pledge['status'] }) {
  const classMap: { [key: string]: string } = {
    draft: 'bg-gray-400 opacity-50',
    committed: 'bg-amber-400/70 ',
    active: 'bg-emerald-500 ',
    done: 'bg-gray-400',
  };
  return (
    <div
      class={`uppercase font-semibold tracking-wider b b-black/10 ${classMap[status]} rounded-md px-2 py-0 text-white`}
    >
      {status}
    </div>
  );
}

function ManageButton({ url, label }: { url: string; label: string }) {
  return (
    <Button href={url} target="_blank">
      {label}
      <span class="ml-2 text-sm" innerHTML={OutLink as unknown as string} />
    </Button>
  );
}

function RecipientsBar({
  recipients,
  pledge,
}: {
  recipients: Record<string, Recipient>;
  pledge: Pledge;
}) {
  type Distribution = { recipient: Recipient; amount: number; pct: number; hue: number };

  const distributions: Distribution[] = [];

  for (let id in pledge.towards) {
    const recipient = recipients[id];
    const pct = pledge.towards[id];
    const amount = pct * pledge.amount;
    distributions.push({ recipient, amount, pct, hue: strToHue(recipient.name) });
  }

  const shadowStyle = { 'box-shadow': 'inset 0 0 1px 0px #0006, inset 0 0 3px 2px #0002' };

  return (
    <div class="">
      <div class="relative h-4 w-full rounded-md mb-2 overflow-hidden flex">
        <For each={distributions}>
          {(distribution) => (
            <div
              class="h-full"
              style={{
                width: `${distribution.pct * 100}%`,
                'background-color': `hsl(${distribution.hue}, 60%, 70%)`,
              }}
            ></div>
          )}
        </For>
        <div class="absolute inset-0" style={shadowStyle}></div>
      </div>
      <div>
        <For each={distributions}>
          {(distribution) => (
            <div class="flexcs">
              <span
                class="inline-block rounded-full h-4 w-4 mr-2"
                style={{
                  'background-color': `hsl(${distribution.hue}, 60%, 70%)`,
                  ...shadowStyle,
                }}
              ></span>
              <div class="inline-block text-sm">
                {distribution.amount.toLocaleString()} {pledge.currency.toUpperCase()}
              </div>
              <div class="inline-block mx-2 opacity-50">&rarr;</div>
              <div class="inline-block text-sm mr-2">{distribution.recipient.name}</div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
