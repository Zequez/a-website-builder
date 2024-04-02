import { FC } from './FC';
import cx from 'classnames';

type ButtonType = FC<{
  onClick?: () => void;
  class?: string;
  size?: 'md' | 'lg';
  href?: string;
}>;

const Button: ButtonType = ({
  onClick,
  class: _class = 'bg-blue-400',
  children,
  size = 'md',
  href,
}) => {
  const Element = href ? 'a' : 'button';
  return (
    <Element
      class={cx([
        'relative group block rounded-md border-1 border-solid border-black/10 text-white/85 uppercase tracking-[1px] font-semibold text-shadow-1',
        _class,
        {
          'px-2 py-1.5 text-sm': size === 'md',
          'px-3 py-2 text-base': size === 'lg',
        },
      ])}
      onClick={onClick}
      href={href}
    >
      {children}
      <div class="absolute inset-0 rounded-md hidden bg-white/10 group-hover:block"></div>
    </Element>
  );
};

export default Button;
