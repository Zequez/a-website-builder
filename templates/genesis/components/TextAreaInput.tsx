import { cx } from '@shared/utils';

const TextAreaInput = ({
  value,
  onChange,
  label,
  class: _class,
  disabled,
  details,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  class?: string;
  disabled?: boolean;
  details?: string;
}) => {
  return (
    <div class={cx('relative w-full pt-2', _class)}>
      <div class="relative w-full">
        <textarea
          aria-label={label}
          placeholder=" "
          class={cx(
            'peer border text-black/70 shadow-sm rounded-md h-30 w-full px-3 py-3 border-black/10 bg-white outline-slate-4',
            {
              'opacity-50': disabled,
            },
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
      </div>
      {details ? <div class="text-black/30 mt-1 ml-2">{details}</div> : null}
    </div>
  );
};

export default TextAreaInput;
