import TriangleExclamationIcon from '~icons/fa6-solid/triangle-exclamation';
import { useEffect, useMemo } from 'preact/hooks';
import { ValidationError, parseAndValidateConfig, validateConfig } from '../../config-validator';
import ErrorsListDisplay from '../ui/ErrorsListDisplay';
import { Button, TextAreaInput } from '../ui';
import migrateConfig from '../../config-migrator';
import { usePatchableStore } from '../../lib/usePatchableStore';
import * as pipes from '../../lib/pipes';

type ConfigurationFixerStore = {
  unknownConfig: string;
  validConfig: null | Config;
  errors: {
    saveConfig: ValidationError[];
  };
  inProgress: {
    saveConfig: boolean;
  };
  done: boolean;
  migrationStatus: 'untried' | 'successful' | 'failed';
};

function useConfigurationFixerStore(init: {
  unknownConfig: Record<string, any>;
  accessToken: string;
  siteId: string;
}) {
  const { patchStore, store } = usePatchableStore<ConfigurationFixerStore>(() => ({
    unknownConfig: JSON.stringify(init.unknownConfig, null, 2),
    validConfig: null,
    errors: {
      saveConfig: [],
    },
    inProgress: {
      saveConfig: false,
    },
    done: false,
    migrationStatus: 'untried',
  }));

  // Computed

  const [maybeConfig, validationErrors] = useMemo(() => {
    return parseAndValidateConfig(store.unknownConfig);
  }, [store.unknownConfig]);

  const errors = useMemo(() => {
    return store.errors.saveConfig.concat(validationErrors);
  }, [store.errors.saveConfig, validationErrors]);

  // Actions

  function attemptMigration() {
    if (maybeConfig) {
      const maybeValidConfig = migrateConfig(maybeConfig);
      const errors = validateConfig(maybeValidConfig);
      const stringified = JSON.stringify(maybeValidConfig, null, 2);

      if (errors.length === 0) {
        patchStore({
          unknownConfig: stringified,
          migrationStatus: 'successful',
        });
      } else {
        patchStore({ unknownConfig: stringified, migrationStatus: 'failed' });
      }
    }
  }

  async function saveConfig() {
    if (validationErrors.length === 0 && maybeConfig) {
      patchStore({ inProgress: { saveConfig: true } });
      const { errors } = await pipes.tsiteSetConfig({
        siteId: init.siteId,
        config: maybeConfig,
        token: init.accessToken,
      });
      patchStore({
        inProgress: { saveConfig: false },
        errors: { saveConfig: errors },
        done: errors.length === 0,
      });
    }
  }

  return {
    store,
    computed: {
      errors,
      maybeConfig,
      validationErrors,
    },
    actions: {
      attemptMigration,
      saveConfig,
      setUnknownConfig: (s: string) => patchStore({ unknownConfig: s }),
    },
  };
}

export default function ConfigurationFixer(p: {
  unknownConfig: Record<string, any>;
  siteId: string;
  accessToken: string;
}) {
  const { store, actions, computed } = useConfigurationFixerStore(p);

  const canSave = computed.validationErrors.length === 0 && computed.maybeConfig;
  const canApplyMigration = !!computed.maybeConfig;

  useEffect(() => {
    if (store.done) {
      // This one could be improved so that it works without reloading the page
      window.location.reload();
    }
  }, [store.done]);

  return (
    <div class="flex flex-col space-y-4 bg-white/20 max-w-screen-sm mx-auto p4 rounded-lg shadow-md">
      <div class="flex">
        <h1 class="text-2xl sm:text-3xl flex-grow relative top-1">
          Se necesita actualizar la configuración
        </h1>
        <div class="flexcc text-7xl text-amber-2 -mr3">
          <TriangleExclamationIcon class="h12" />
        </div>
      </div>
      <div class="space-y-1">
        <p>Es probable que el esquema de configuración del sistema haya sido actualizado.</p>
        <p>
          No te preocupes, puedo intentar ajustarlo automáticamente. Y si eso no funciona también se
          puede ajustar manualmente.
        </p>
      </div>
      {computed.validationErrors.length > 0 && (
        <Button
          disabled={!canApplyMigration}
          onClick={actions.attemptMigration}
          tint="green-brighter"
        >
          Ajuste automático
        </Button>
      )}
      {store.migrationStatus === 'successful' ? (
        <div class="p4 rounded-md bg-emerald-400 font-semibold text-white shadow-md tracking-wider">
          Funcionó! Ya podés guardar la nueva configuración.
        </div>
      ) : store.migrationStatus === 'failed' ? (
        <div class="p4 rounded-md bg-yellow-400 font-semibold text-white shadow-md tracking-wider">
          No funcionó. Vas a tener que arreglarlo manualmente. Hablá con Ezequiel.
        </div>
      ) : null}

      <div class="py4">
        <TextAreaInput
          class="h-120 font-mono -mx8 md:-mx20 w-auto! shadow-lg"
          inputClass="rounded-0! sm:rounded-md!"
          label="Configuración"
          value={store.unknownConfig}
          onChange={actions.setUnknownConfig}
        />
      </div>
      {computed.errors.length ? (
        <div>
          <div class="text-2xl">Errores detectados</div>
        </div>
      ) : null}
      <ErrorsListDisplay class="pb4" errors={computed.errors} />
      <Button
        disabled={!canSave || store.inProgress.saveConfig}
        onClick={actions.saveConfig}
        class="bg-white/20 hover:bg-white/30 rounded-md text-black/40 font-semibold px3 py1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/20"
      >
        {store.inProgress.saveConfig ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  );
}
