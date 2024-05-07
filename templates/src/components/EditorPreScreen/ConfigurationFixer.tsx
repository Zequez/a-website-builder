import { useMemo, useState } from 'preact/hooks';
import { ValidationError, valErr, validateConfig } from '../../config-validator';
import useStore from '../../lib/useStore';
import ErrorsListDisplay from '../ui/ErrorsListDisplay';

export default function ManualConfigurator({ config }: { config: any }) {
  const {
    actions: { retryFixConfig },
    store: { remoteSetConfigErrors },
  } = useStore();
  const [val, setVal] = useState(() => JSON.stringify(config, null, 2));
  const [parseError, setParseError] = useState<ValidationError | null>(null);
  const [validatorErrors, setValidatorErrors] = useState<ValidationError[]>(() =>
    validateConfig(config),
  );

  const canSave = !parseError && validatorErrors.length === 0;

  function handleInput(val: string) {
    setVal(val);

    let parsedConfig: any;
    try {
      parsedConfig = JSON.parse(val);
      setParseError(null);
      setValidatorErrors(validateConfig(parsedConfig));
    } catch (e) {
      setParseError(valErr((e as any).message));
    }
  }

  const errors = useMemo(() => {
    const errs = [...validatorErrors, ...remoteSetConfigErrors];
    if (parseError) errs.push(parseError);
    return errs;
  }, [validatorErrors, remoteSetConfigErrors, parseError]);

  return (
    <div>
      <h1 class="my4">Configuración inválida</h1>
      <textarea
        class="rounded-md w-full p4 h-120 text-black/60 font-mono mb-4"
        value={val}
        onChange={({ currentTarget }) => handleInput(currentTarget.value)}
      />
      <ErrorsListDisplay errors={errors} />
      <button
        disabled={!canSave}
        onClick={() => retryFixConfig(JSON.parse(val))}
        class="bg-white/20 hover:bg-white/30 rounded-md text-black/40 font-semibold px3 py1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/20"
      >
        Reintentar
      </button>
    </div>
  );
}
