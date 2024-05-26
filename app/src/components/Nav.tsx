import { cx } from '@shared/utils';
import useStore from '../lib/useEditorStore';
import { useRef } from 'preact/hooks';

export function Nav() {
  const {
    store: { selectedPageId, editing },
    navPages,
    actions: A,
  } = useStore();

  return navPages.length > 1 ? (
    <nav class="bg-white/10 b-t b-t-main-400 rounded-b-lg flexcc flex-wrap text-2xl space-x-1">
      {navPages.map(({ uuid, path, title, icon }) => (
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
  ) : null;
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
        'relative px3 group sm:px4 py1 sm:py2 -mt1 -mb1 h-12 rounded-lg flexcc font-medium hover:z-30 tracking-wide',
        {
          'bg-main-900 text-black/90 shadow-md': p.active,
          'hover:bg-white/20 text-white/60': !p.active,
        },
      )}
      onClick={p.onClick}
      onTouchStart={p.onClick}
      href={p.path}
    >
      <span class="whitespace-nowrap">
        <span class="mr-2 text-black/100">{p.icon}</span>
        {p.title}
      </span>
    </a>
  );
}
