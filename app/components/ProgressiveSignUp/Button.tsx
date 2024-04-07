// ██████╗ ██╗   ██╗████████╗████████╗ ██████╗ ███╗   ██╗
// ██╔══██╗██║   ██║╚══██╔══╝╚══██╔══╝██╔═══██╗████╗  ██║
// ██████╔╝██║   ██║   ██║      ██║   ██║   ██║██╔██╗ ██║
// ██╔══██╗██║   ██║   ██║      ██║   ██║   ██║██║╚██╗██║
// ██████╔╝╚██████╔╝   ██║      ██║   ╚██████╔╝██║ ╚████║
// ╚═════╝  ╚═════╝    ╚═╝      ╚═╝    ╚═════╝ ╚═╝  ╚═══╝

import { cx } from '@app/lib/utils';

const Button = ({
  children,
  disabled,
  class: _class,
  onClick,
  href,
}: {
  children: any;
  disabled?: boolean;
  class?: string | Record<string, boolean>;
  onClick?: () => void;
  href?: string;
}) => {
  const El = href ? 'a' : 'button';
  return (
    <El
      disabled={disabled}
      onClick={onClick}
      href={href}
      class={cx(
        `flex w-full text-black/60 justify-center items-center bg-slate-2
            border border-slate-3 rounded-md px-4 py-2 shadow-md cursor-pointer
            hover:(bg-slate-6 text-white/60)
            disabled:(opacity-40 saturate-0 pointer-events-none)
            outline-slate-4
            font-semibold
            active:(shadow-none scale-98)
            `,
        _class,
      )}
    >
      {children}
    </El>
  );
};

export default Button;
