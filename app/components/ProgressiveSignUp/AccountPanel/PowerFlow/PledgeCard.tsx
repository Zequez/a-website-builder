/** @jsxImportSource solid-js */

import OutLink from '~icons/fa6-solid/up-right-from-square?raw';
import { Accessor, For, Match, Show, Switch } from 'solid-js';
import { Pledge, Recipient } from './types';
import { strToHue } from '@app/lib/utils';

function pledgeTotal(pledge: Pledge) {
  return pledge.historic.reduce((all, [date, amount]) => {
    return all + amount;
  }, 0);
}

const getManageButtonData = (pledge: Pledge) => {
  if (pledge.currency === 'ARS') {
    return { href: 'https://mercadopago.com.ar', label: 'Manage on MercadoPago' };
  } else {
    return { href: 'https://gumroad.com', label: 'Manage on Gumroad' };
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
                {p.pledge.currency}
                <Switch>
                  <Match when={p.pledge.mode === 'recurring-year'}> / year</Match>
                  <Match when={p.pledge.mode === 'recurring-month'}> / month</Match>
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
                    {amount.toLocaleString()} {p.pledge.currency}
                  </div>
                </div>
              )}
            </For>
            <div class="bg-slate-500 px-2 py-1 text-right text-white/75">
              <span class="tracking-wider">TOTAL:</span>{' '}
              <span class="font-black">
                {pledgeTotal(p.pledge)} {p.pledge.currency}
              </span>
            </div>
          </div>
        </div>
      </Show>
      <Show when={p.pledge.status === 'committed'}>
        <div class="px-4 mb-4 text-white">
          <div class="bg-amber-400/70 p-4 rounded-md b b-black/10 text-center">
            Your pledge is comitted. Awaiting payment signal.
          </div>
        </div>
        <div class="px-4 mb-4 flexee">
          <Button onClick={p.onCancel}>Cancel</Button>
        </div>
      </Show>
      <Show when={p.pledge.mode.startsWith('recurring')}>
        <div class="flexee px-4 mb-4">
          <ManageButton {...getManageButtonData(p.pledge)} />
        </div>
      </Show>
    </div>
  );
}

export function DraftPledgeCard(p: {
  pledge: Pledge;
  recipients: Record<string, Recipient>;
  onCommit: () => void;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string) => void;
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
                onChange={({ currentTarget }) => p.onCurrencyChange(currentTarget.value)}
                class="rounded-md w-full h-8 xs:h-10 sm:px-2 sm:py-1 text-center"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
              <select
                value={p.pledge.mode}
                class="rounded-md w-full sm:w-30 sm:px-2 sm:py-1 h-8 xs:h-10 text-center"
                onChange={({ currentTarget }) => {
                  p.onModeChange(currentTarget.value as Pledge['mode']);
                }}
              >
                <option value={'recurring-month'}>Recurring monthly</option>
                <option value={'recurring-year'}>Recurring yearly</option>
                <option value={'onetime'}>One time</option>
              </select>
            </div>
          </div>
          <StatusBadge status={p.pledge.status} />
        </div>
      </div>
      <div class="flexee px-4 mb-4">
        <div class="flex-grow text-black/40">Recipient: Hoja team (the only team for now)</div>
        <Button onClick={p.onCommit}>Commit</Button>
      </div>
    </div>
  );
}

function Button({
  onClick,
  href,
  target,
  children,
}: {
  href?: string;
  target?: string;
  onClick?: () => void;
  children: any;
}) {
  const _class =
    'flexcc px-2 py-1 bg-slate-400 b b-black/10 rounded-md text-white/90 cursor-pointer hover:bg-slate-500';
  return href ? (
    <a class={_class} href={href} target={target}>
      {children}
    </a>
  ) : (
    <button class={_class} onClick={onClick}>
      {children}
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

function ManageButton({ href, label }: { href: string; label: string }) {
  return (
    <Button href={href} target="_blank">
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
                {distribution.amount.toLocaleString()} {pledge.currency}
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
