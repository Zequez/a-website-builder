import { cx } from '@shared/utils';
import { useState } from 'preact/hooks';
import Eye from '~icons/fa6-solid/eye';
import EyeSlash from '~icons/fa6-solid/eye-slash';
const TextInput = ({
  value,
  onChange,
  label,
  class: _class,
  type: _type,
  disabled,
  details,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  class?: string;
  type?: string;
  disabled?: boolean;
  details?: string;
}) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div class={cx('relative w-full pt-2', _class)}>
      <div class="relative w-full">
        <input
          aria-label={label}
          placeholder=" "
          class={cx(
            'peer border text-black/70 shadow-sm rounded-md h-10 w-full px-3 border-black/10 bg-white outline-slate-4',
            {
              'pr-10': _type === 'password',
              'opacity-50': disabled,
            },
          )}
          type={showPass ? 'text' : _type}
          name={label}
          value={value}
          onInput={({ currentTarget }) => {
            onChange(currentTarget.value);
          }}
          disabled={disabled}
        />
        <label
          for={label}
          class={cx(
            `
          absolute top-1/2 transition-all bg-white px-1 rounded-md -translate-y-1/2 left-3 text-black/40 pointer-events-none
          peer-not-placeholder-shown:(top-0 text-white bg-slate-6 scale-90)
          peer-focus:(top-0 text-white bg-slate-6 scale-90)`,
            {
              'opacity-50': disabled,
            },
          )}
        >
          {label}
        </label>
        {_type === 'password' && (
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
      {details ? <div class="text-black/30 mt-1 ml-2">{details}</div> : null}
    </div>
  );
};

export default TextInput;
