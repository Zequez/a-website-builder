import { useState } from 'preact/hooks';
import { ValidationError, validateConfig } from '../config-validator';
import useStore from '../lib/useStore';

// function validateValue(config: string) {
//   let parsedConfig: any;
//     try {
//       parsedConfig = JSON.parse(val);
//       setParseError('');
//       const validator = createValidator();
//       if (!validator(parsedConfig)) {
//         console.log(validator.errors);
//         setValidatorErrors(['Validation errors']);
//       } else {
//         setValidatorErrors([]);
//       }
//     } catch (e) {
//       setParseError((e as any).message);
//     }
//       }
// }

export default function ManualConfigurator({ config }: { config: any }) {
  const {
    actions: { setConfig },
    store: { remoteSetConfigErrors },
  } = useStore();
  const [val, setVal] = useState(() => JSON.stringify(config, null, 2));
  const [parseError, setParseError] = useState('');
  const [validatorErrors, setValidatorErrors] = useState<ValidationError[]>(() =>
    validateConfig(config),
  );

  const canSave = parseError === '' && validatorErrors.length === 0;

  function handleInput(val: string) {
    setVal(val);

    let parsedConfig: any;
    try {
      parsedConfig = JSON.parse(val);
      setParseError('');
      setValidatorErrors(validateConfig(parsedConfig));
    } catch (e) {
      setParseError((e as any).message);
    }
  }

  return (
    <div>
      <h1 class="my4">Configuración inválida</h1>
      <textarea
        class="rounded-md w-full p4 h-120 text-black/60 font-mono mb-4"
        value={val}
        onChange={({ currentTarget }) => handleInput(currentTarget.value)}
      />
      <div class="text-red-500">
        {!!parseError && <div class="mb-2">{parseError}</div>}
        {validatorErrors.map(validationErrorToMessage)}
        {remoteSetConfigErrors.map(validationErrorToMessage)}
      </div>
      <button
        disabled={!canSave}
        onClick={() => setConfig(JSON.parse(val))}
        class="bg-white/20 hover:bg-white/30 rounded-md text-black/40 font-semibold px3 py1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/20"
      >
        Reintentar
      </button>
    </div>
  );
}

function validationErrorToMessage(error: ValidationError) {
  return (
    <div class="mb-2">
      [{error.path}] {capitalizeFirstLetter(error.message)}
      <div>{JSON.stringify(error.params)}</div>
    </div>
  );
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
}
