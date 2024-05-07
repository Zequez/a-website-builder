import { cx } from '@shared/utils';

const TextAreaInput = ({
  value,
  onChange,
  label,
  class: _class,
  inputClass,
  disabled,
  details,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  class?: string;
  inputClass?: string;
  disabled?: boolean;
  details?: string;
}) => {
  return (
    <div class={cx('relative w-full pt-2', _class)}>
      <div class="relative w-full h-full">
        <textarea
          aria-label={label}
          placeholder=" "
          class={cx(
            'peer border text-black/70 shadow-sm rounded-md h-30 w-full px-3 py-3 border-black/10 bg-white outline-slate-4 h-full',
            {
              'opacity-50': disabled,
            },
            inputClass,
          )}
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
          absolute top-1 transition-all bg-white px-1 rounded-md left-1 text-black/40 pointer-events-none
          peer-not-placeholder-shown:(-top-3 text-white bg-slate-6 scale-90)
          peer-focus:(-top-3 text-white bg-slate-6 scale-90)`,
            {
              'opacity-50': disabled,
            },
          )}
        >
          {label}
        </label>
      </div>
      {details ? <div class="text-black/30 mt-1 ml-2">{details}</div> : null}
    </div>
  );
};

export default TextAreaInput;
