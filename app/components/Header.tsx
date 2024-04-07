import { cx } from '@app/lib/utils';
import Button from './Button';

const Header = ({
  isAuth,
  signOut,
  class: _class,
  translucent,
}: {
  isAuth: boolean;
  signOut: () => void;
  class?: string;
  translucent?: boolean;
}) => {
  return (
    <div
      class={cx('relative z-0  flex-shrink-0 pt-2 w-full', _class, {
        'bg-slate-600': !translucent,
        'bg-slate-600/50': translucent,
      })}
    >
      <div class="flex flex-wrap items-center px-4 max-w-screen-md mx-auto">
        <div class="flex-grow flex items-center h-10 mb-2 ">
          <a href="/" class="p-1 relative rounded-md flex ">
            <span class="relative z-20 rounded-md bg-white/90 shadow-sm text-slate-400 text-xl md:text-2xl font-semibold tracking-widest font-serif px-2 py-0.5">
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-sky-400">
                HOJAWEB.XYZ
              </span>
            </span>
            <div class="z-10 absolute inset-0 bg-gradient-to-r from-amber-400 to-sky-400 blur-md"></div>
          </a>
          <div class="ml-2 xs:ml-4 text-white font-bold uppercase tracking-widest line-height-tight text-xs sm:text-sm">
            Web creation
            <br />
            club
          </div>
        </div>
        <div class="flex space-x-2 justify-end  items-center flex-grow h-10 mb-2">
          {isAuth ? (
            <Button class="bg-red-500" onClick={signOut}>
              Logout
            </Button>
          ) : null}
          <Button class="bg-blue-500 " href="#auth">
            {isAuth ? 'Account' : 'Access'}
          </Button>
          {isAuth ? (
            <Button class="bg-emerald-500" href={'/editor/'}>
              Editor
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Header;
