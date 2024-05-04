import PencilIcon from '~icons/fa6-solid/pencil';
import { useRef, useState } from 'preact/hooks';
import VGripLinesIcon from '~icons/fa6-solid/grip-lines-vertical';
import { cx } from '@shared/utils';
import useStore from '../lib/useStore';

// function SocialItem ({ href, children }: { href: string; children: any }) {
// }
export function Nav() {
  const { navPages } = useStore();

  return (
    <nav class="bg-white/30 rounded-b-lg flexcc flex-wrap text-xl sm:text-2xl space-x-1">
      {navPages.map(({ path, title, icon }) => (
        <div class="flex">
          <NavItem active={path === '/'} path={path} icon={icon} title={title} />
        </div>
      ))}
    </nav>
  );
}

export function NavItem(p: { path: string; icon: string; title: string; active?: boolean }) {
  return (
    <a
      class={cx(
        'relative px3 sm:px4 py1 sm:py2 -mt1 -mb1 rounded-lg flexcc text-black/40 font-light hover:z-30',
        {
          'bg-emerald-500 text-white  shadow-md': p.active,
          'hover:bg-white/40': !p.active,
        },
      )}
      href={p.path}
    >
      <span class="whitespace-nowrap">
        <span class="mr-2">{p.icon}</span>
        {p.title}
      </span>
    </a>
  );
}
