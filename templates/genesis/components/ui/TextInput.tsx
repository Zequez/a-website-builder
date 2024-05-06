import { cx } from '@shared/utils';
import { useState } from 'preact/hooks';
import Eye from '~icons/fa6-solid/eye';
import EyeSlash from '~icons/fa6-solid/eye-slash';
const TextInput = (p: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  class?: string;
  type?: string;
  disabled?: boolean;
  details?: string;
  joinR?: boolean;
}) => {
  const [showPass, setShowPass] = useState(false);

  const roundedClass = p.joinR ? 'rounded-l-md' : 'rounded-md';

  return (
    <div class={cx('relative w-full', p.class)}>
      <div class="relative w-full">
        <input
          aria-label={p.label}
          placeholder=" "
          class={cx(
            'peer border text-black/70 shadow-sm h-10 w-full px-3 border-black/10 bg-white outline-slate-4',
            roundedClass,
            {
              'pr-10': p.type === 'password',
              'opacity-50': p.disabled,
            },
          )}
          type={showPass ? 'text' : p.type}
          name={p.label}
          value={p.value}
          onInput={({ currentTarget }) => {
            p.onChange(currentTarget.value);
          }}
          disabled={p.disabled}
        />
        <label
          for={p.label}
          class={cx(
            `
          absolute top-1/2 transition-all bg-white px-1 rounded-md -translate-y-1/2 left-1 text-black/40 pointer-events-none
          peer-not-placeholder-shown:(top-0 text-white bg-slate-6 scale-90)
          peer-focus:(top-0 text-white bg-slate-6 scale-90)`,
            {
              'opacity-50': p.disabled,
            },
          )}
        >
          {p.label}
        </label>
        {p.type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            tabIndex={-1}
            class="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 outline-slate-4"
          >
            {showPass ? <Eye /> : <EyeSlash />}
          </button>
        )}
      </div>
      {p.details ? <div class="text-black/30 mt-1 ml-2">{p.details}</div> : null}
    </div>
  );
};

export default TextInput;
