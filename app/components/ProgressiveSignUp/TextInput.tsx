import { cx } from '@app/lib/utils';
import { useState } from 'preact/hooks';
import Eye from '~icons/fa6-solid/eye';
import EyeSlash from '~icons/fa6-solid/eye-slash';
import CircleNotch from '~icons/fa6-solid/circle-notch';

let didFocus = false;
const TextInput = ({
  value,
  onChange,
  label,
  class: _class,
  type: _type,
  onBlur,
  disabled,
  loading,
  loadingLabel,
  validations,
  onFullyValid,
  autoFocus,
  details,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  class?: string;
  type?: string;
  onBlur?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  validations?: {
    sync?: (val: string) => any[];
    async?: (val: string) => Promise<any[]>;
    force?: (val: string) => string;
    maxLength?: number;
  };
  onFullyValid?: (isFullyValid: boolean) => void;
  autoFocus?: boolean;
  details?: string;
}) => {
  const [showPass, setShowPass] = useState(false);
  const [isModifiedAndBlurred, setIsModifiedAndBlurred] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isLoadingAsyncValidation, setIsLoadingAsyncValidation] = useState(false);

  const showErrors = isModifiedAndBlurred && validationErrors.length > 0;

  return (
    <div class={cx('relative w-full', _class)}>
      <div class="relative w-full">
        <input
          maxLength={validations?.maxLength}
          ref={(el) => {
            if (!didFocus && autoFocus) {
              el?.focus();
              didFocus = true;
            }
          }}
          aria-label={label}
          placeholder=" "
          class={cx('peer border  shadow-sm rounded-md h-10 w-full px-3', {
            'pr-10': _type === 'password',
            'border-red-500 bg-red-500/10 outline-red-500': validationErrors.length > 0,
            'border-black/10 bg-white outline-slate-4': validationErrors.length === 0,
            'opacity-50': disabled || loading || isLoadingAsyncValidation,
          })}
          type={showPass ? 'text' : _type}
          name={label}
          value={value}
          onChange={({ currentTarget }) => {
            console.log(validations?.force?.(currentTarget.value));
            const newValue = validations?.force
              ? validations.force(currentTarget.value)
              : currentTarget.value;
            onChange(newValue);
            if (validations?.sync) {
              const errors = validations.sync(newValue);
              setValidationErrors(errors);
              if (!validations.async) {
                onFullyValid?.(errors.length === 0);
              }
            }
            if (validations?.async) {
              onFullyValid?.(false);
            }
          }}
          onBlur={async ({ currentTarget }) => {
            const isModifiedAndBlurred = value !== '';
            setIsModifiedAndBlurred(isModifiedAndBlurred);
            if (isModifiedAndBlurred) {
              if (validations?.async) {
                if (validationErrors.length === 0) {
                  setIsLoadingAsyncValidation(true);
                  const errors = await validations.async(value);
                  setValidationErrors(errors);
                  onFullyValid?.(errors.length === 0);
                  setIsLoadingAsyncValidation(false);
                }
              }
            }
          }}
          disabled={disabled || isLoadingAsyncValidation}
        />
        <label
          for={label}
          class={cx(
            `
          absolute top-1/2 transition-all bg-white px-1 rounded-md -translate-y-1/2 left-3 text-black/40 pointer-events-none
          peer-not-placeholder-shown:(top-0 text-white bg-slate-6 scale-90)
          peer-focus:(top-0 text-white bg-slate-6 scale-90)`,
            {
              'peer-focus:bg-red-500! peer-not-placeholder-shown:bg-red-500!': showErrors,
              'opacity-50': disabled || loading || isLoadingAsyncValidation,
            },
          )}
        >
          {label}
        </label>
        {_type === 'password' && (
          <button
            onClick={() => setShowPass(!showPass)}
            tabIndex={-1}
            class="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 outline-slate-4"
          >
            {showPass ? <Eye /> : <EyeSlash />}
          </button>
        )}
        {isLoadingAsyncValidation && (
          <div class="absolute right-2 top-1/2 text-black opacity-40 -translate-y-1/2 whitespace-nowrap">
            <span class="pulse-opacity">{loadingLabel}</span>
            &nbsp;
            <CircleNotch class="spin inline-block" />
          </div>
        )}
      </div>
      {isModifiedAndBlurred && validationErrors.length ? (
        <div class="text-red-500 mt-1 ml-2">
          {validationErrors.map((error) => (
            <div>{error}</div>
          ))}
        </div>
      ) : null}
      {details ? <div class="text-black/30 mt-1 ml-2">{details}</div> : null}
    </div>
  );
};

export default TextInput;
