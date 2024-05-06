import { cx } from '@shared/utils';
import { Ref } from 'preact';

export default function Button(p: {
  children: any;
  onClick?: () => void;
  disabled?: boolean;
  tint?: 'red' | 'green' | 'green-brighter';
  expandH?: boolean;
  class?: string;
  reff?: Ref<HTMLButtonElement>;
  customSize?: boolean;
  joinL?: boolean;
}) {
  const tintClass = {
    red: 'bg-red-500',
    green: 'bg-emerald-500',
    'green-brighter': 'bg-green-500',
    '': '',
  }[p.tint || ''];

  const expandClass = p.expandH ? 'w-full' : '';
  const paddingClass = p.customSize ? '' : 'px2 py1';
  const minWClass = p.customSize ? '' : 'min-w-20';
  const heightClass = p.customSize ? '' : 'h-10';
  const roundedClass = p.joinL ? 'rounded-r-md' : 'rounded-md';

  return (
    <button
      ref={p.reff}
      class={cx(
        `
        flexcc
        bg-gradient-to-b from-white/30 to-white/20
        text-white  text-shadow-1 font-semibold tracking-wider
        b b-white/10 b-t-white/30
        shadow-sm
        hover:to-white/25
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:to-white/20
        disabled:saturate-0
        outline-white
        active:scale-98
        active:shadow-none
      `,
        roundedClass,
        heightClass,
        paddingClass,
        minWClass,
        tintClass,
        expandClass,
        p.class,
      )}
      disabled={p.disabled}
      onClick={p.onClick}
    >
      {p.children}
    </button>
  );
}
