import { cx } from '@shared/utils';
import { Ref } from 'preact';

const TINTS = {
  '': '',
  red: 'bg-red-500',
  green: 'bg-emerald-500',
  'green-brighter': 'bg-green-500',
  purple: 'bg-purple-500',
  teal: 'bg-teal-500',
};

export default function Button(p: {
  children: any;
  onClick?: () => void;
  disabled?: boolean;
  tint?: keyof typeof TINTS;
  expandH?: boolean;
  class?: string;
  reff?: Ref<HTMLButtonElement>;
  customSize?: boolean;
  joinL?: boolean;
  joinR?: boolean;
  align?: 'left' | 'right' | 'center';
}) {
  const tintClass = TINTS[p.tint || ''];

  const expandClass = p.expandH ? 'w-full' : '';
  const paddingClass = p.customSize ? '' : 'px2 py1';
  const minWClass = p.customSize ? '' : 'min-w-20';
  const heightClass = p.customSize ? '' : 'h-10';
  // prettier-ignore
  const roundedClass =
    p.joinL && p.joinR ?
      ''
      : p.joinL ? 'rounded-r-md'
      : p.joinR ? 'rounded-l-md'
      : 'rounded-md';

  const align = p.align || 'center';
  const justifyClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  return (
    <button
      ref={p.reff}
      class={cx(
        `group
        flex items-center flex-shrink-0
        bg-gradient-to-b from-white/30 to-white/20
        text-white  text-shadow-1 font-semibold tracking-wider
        b b-white/10 b-t-white/30
        shadow-sm outline-white
        hover:to-white/25
        active:(shadow-none saturate-110 from-white/20)
        disabled:(opacity-50 cursor-not-allowed to-white/20 saturate-0)
      `,
        justifyClass,
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
