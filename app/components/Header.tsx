import Button from './Button';

const Header = ({ isAuth, signOut }: { isAuth: boolean; signOut: () => void }) => {
  return (
    <div class="relative z-0 bg-lime-600/80 flex flex-wrap items-center px-4 flex-shrink-0 pt-2">
      <div class="flex-grow flex items-center justify-center h-10 mb-2">
        <span class="rounded-md bg-white/90 shadow-sm text-lime-600 text-xl md:text-2xl font-semibold tracking-widest font-serif px-2 py-0.5 text-shadow-inner-1">
          HOJAWEB.XYZ
        </span>
        <div class="ml-2 text-white font-semibold">Web Building Club</div>
      </div>
      <div class="flex space-x-2 justify-center  items-center flex-grow h-10 mb-2">
        {isAuth ? (
          <Button _class="bg-red-400" onClick={signOut}>
            Logout
          </Button>
        ) : null}
        <Button _class="bg-blue-400 " href="#auth">
          {isAuth ? 'Account' : 'Access'}
        </Button>
        {isAuth ? (
          <Button _class="bg-emerald-400" href={'/editor'}>
            Editor
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
