import { cx } from '@shared/utils';
import useStore from '../lib/useStore';
import { useRef } from 'preact/hooks';

export function Nav() {
  const {
    store: { selectedPageId, editing },
    navPages,
    actions: A,
  } = useStore();

  return (
    <nav class="bg-white/30 rounded-b-lg flexcc flex-wrap text-xl sm:text-2xl space-x-1">
      {navPages.length > 1 &&
        navPages.map(({ uuid, path, title, icon }) => (
          <div class="flex">
            <NavItem
              onClick={(ev: MouseEvent | TouchEvent) => {
                ev.preventDefault();
                A.navigateTo(path);
              }}
              active={uuid === selectedPageId}
              path={path}
              icon={icon}
              title={title}
            />
          </div>
        ))}
    </nav>
  );
}

export function NavItem(p: {
  path: string;
  icon: string;
  title: string;
  active?: boolean;
  onClick: (ev: MouseEvent | TouchEvent) => void;
}) {
  return (
    <a
      class={cx(
        'relative px3 sm:px4 py1 sm:py2 -mt1 -mb1 rounded-lg flexcc text-black/40 font-light hover:z-30',
        {
          'bg-emerald-500 text-white shadow-md': p.active,
          'hover:bg-white/40': !p.active,
        },
      )}
      onClick={p.onClick}
      onTouchStart={p.onClick}
      href={p.path}
    >
      <span class="whitespace-nowrap">
        <span class="mr-2">{p.icon}</span>
        {p.title}
      </span>
    </a>
  );
}
