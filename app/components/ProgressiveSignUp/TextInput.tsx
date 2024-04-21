import { cx } from '@app/lib/utils';
import { useCallback, useRef, useState } from 'preact/hooks';
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
  const [isTouched, setIsTouched] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [becameStill, setBecameStill] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [asyncValidationPending, setAsyncValidationPending] = useState(false);
  const [isLoadingAsyncValidation, setIsLoadingAsyncValidation] = useState<string | null>(null);
  const [asyncSucceedValues, setAsyncSucceedValues] = useState<string[]>([value]);
  const stillnessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const asyncValidationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const asyncValidationRejectPromiseRef = useRef<(() => void) | null>(null);

  const showErrors = ((isTouched && isBlurred) || becameStill) && validationErrors.length > 0;

  function handleOnChange(inputVal: string) {
    console.log('Handling change');
    if (becameStill) setBecameStill(false);
    if (stillnessTimeoutRef.current) {
      clearTimeout(stillnessTimeoutRef.current);
    }
    if (!isTouched) setIsTouched(true);
    setTimeout(() => {
      setBecameStill(true);
      stillnessTimeoutRef.current = null;
    }, 1500);

    processValidation(inputVal, false);
  }

  async function processValidation(inputVal: string, fromBlur: boolean) {
    if (validations) {
      if (isLoadingAsyncValidation === inputVal) {
        return;
      }

      let isFullyValid = true;

      const val = validations.force ? validations.force(inputVal) : inputVal;

      if (!fromBlur) {
        onChange(val);
      }

      if (validations.sync) {
        const errors = validations.sync(val);
        setValidationErrors(errors);
        isFullyValid = errors.length === 0;
        if (!isFullyValid && asyncValidationRejectPromiseRef.current) {
          asyncValidationRejectPromiseRef.current();
          setAsyncValidationPending(false);
        }
      }

      if (isFullyValid && validations.async) {
        onFullyValid?.(false);
        setAsyncValidationPending(true);
        try {
          const errors = await debouncedAsyncValidation(val, fromBlur);
          console.log('Setting validation errors', errors);
          setValidationErrors(errors);
          setAsyncValidationPending(false);
          isFullyValid = errors.length === 0;
        } catch (e) {
          console.log('Async validation cancelled');
          return;
        }
      } else {
        setAsyncValidationPending(false);
      }

      onFullyValid?.(isFullyValid);
    } else {
      onChange(inputVal);
    }
  }

  const debouncedAsyncValidation = async (inputVal: string, instant: boolean) => {
    return new Promise<any[]>((resolve, reject) => {
      if (asyncValidationTimeoutRef.current) {
        clearTimeout(asyncValidationTimeoutRef.current);
        asyncValidationTimeoutRef.current = null;
      }

      if (asyncValidationRejectPromiseRef.current) {
        asyncValidationRejectPromiseRef.current();
        asyncValidationRejectPromiseRef.current = null;
      }

      function cancel() {
        if (asyncValidationTimeoutRef.current) {
          clearTimeout(asyncValidationTimeoutRef.current);
        }

        reject();
        setIsLoadingAsyncValidation(null);
        asyncValidationRejectPromiseRef.current = null;
      }

      if (asyncSucceedValues.indexOf(inputVal) !== -1) {
        resolve([]);
      } else {
        asyncValidationRejectPromiseRef.current = cancel;

        asyncValidationTimeoutRef.current = setTimeout(
          async () => {
            setIsLoadingAsyncValidation(inputVal);
            const asyncErrorsResult = await validations!.async!(inputVal);
            if (asyncErrorsResult.length === 0) {
              setAsyncSucceedValues(asyncSucceedValues.concat([inputVal]));
            }
            if (asyncValidationRejectPromiseRef.current === cancel) {
              asyncValidationRejectPromiseRef.current = null;
              resolve(asyncErrorsResult);
              setIsLoadingAsyncValidation(null);
            }
          },
          instant ? 0 : 1000,
        );
      }
    });
  };

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
            'border-amber-500 bg-amber-500/10 outline-amber-500': asyncValidationPending,
            'border-red-500 bg-red-500/10 outline-red-500':
              validationErrors.length > 0 && !asyncValidationPending,
            'border-black/10 bg-white outline-slate-4':
              validationErrors.length === 0 && !asyncValidationPending,
            'opacity-50': disabled || loading,
          })}
          type={showPass ? 'text' : _type}
          name={label}
          value={value}
          onInput={({ currentTarget }) => {
            console.log(currentTarget);
            handleOnChange(currentTarget.value);
          }}
          onBlur={async ({ currentTarget }) => {
            if (!isBlurred) {
              const isModifiedAndBlurred = value !== '';
              setIsBlurred(isModifiedAndBlurred);
            }
            if (isBlurred) {
              processValidation(currentTarget.value, true);
            }
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
              'bg-amber-500! bg-amber-500! text-white!': asyncValidationPending,
              'bg-red-500! bg-red-500! text-white!':
                validationErrors.length > 0 && !asyncValidationPending,
              'opacity-50': disabled || loading,
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
      {showErrors && validationErrors.length ? (
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
