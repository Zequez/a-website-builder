import useStore from '../lib/useStore';
import App from './App';
import { TextInput, TextAreaInput, Button } from './ui';
import { cx } from '@shared/utils';
import PagesList from './PagesList';
import EditorPreScreen from './EditorPreScreen';
import { useState } from 'preact/hooks';

export default function AppWithEditor() {
  const {
    store,
    configChanged,
    subdomainChanged,
    publishedConfigIsDifferent,
    showPreScreen,
    actions: A,
  } = useStore();

  function saveConfig() {
    A.saveConfig();
  }

  const [previewing, _previewing] = useState(false);

  const [deploySiteResult, setDeploySiteResult] = useState(true);
  async function handleDeploySite() {
    setDeploySiteResult(await A.deploySite());
  }

  const C = store.config;

  if (showPreScreen) return <EditorPreScreen />;

  return (
    <div class="h-screen w-screen flex">
      <div class="relative w-full sm:w-60 bg-gray-800 text-white flex-shrink-0 flex flex-col pb0 sm:pb2  overflow-auto space-y-2 pt2 pb14 sm:pb2 px4">
        <Separator>Sitio</Separator>
        <TextInput
          label="Titulo"
          value={C.title}
          onChange={(val) => A.setConfigVal('title', val)}
        />
        <TextAreaInput
          label="Descripción"
          value={C.description}
          onChange={(val) => A.setConfigVal('description', val)}
        />

        {/* <Separator>Diseño</Separator>
        <div class="flexcc mb2 px-4">
          Color principal <input type="color" value={C.themeColor} />
        </div> */}

        <Separator>Páginas</Separator>
        <PagesList />

        {/* <Separator>Links Redes</Separator>
        <div class="flexcc mb2 px-4">
          Instagram Facebook Whatsapp YouTube Telegram Twitter LinkedIn Github
        </div> */}

        <div class="flex-grow"></div>

        <Separator>Dirección</Separator>
        <TextInput
          label="Subdominio"
          value={C.subdomain}
          onChange={(val) => A.setConfigVal('subdomain', val)}
        />

        <select
          disabled={true}
          onChange={(val) => A.setConfigVal('domain', val)}
          class="w-full text-black/70 rounded-md py2 px2 h-10 flex-shrink-0"
        >
          <option value="hoja.ar">.{C.domain}</option>
        </select>

        {/* <div class="px4">
          {store.subdomainAvailabilityStatus === 'unknown' && (
            <div class="mb2">Checkeando disponibilidad...</div>
          )}
          {store.subdomainAvailabilityStatus === 'available' && subdomainChanged && (
            <div class="mb2">Subdominio disponible</div>
          )}
          {store.subdomainAvailabilityStatus === 'taken' && (
            <div class="text-center text-red-500 mb2">Subdominio no disponible</div>
          )}
        </div> */}

        <Button
          expandH
          onClick={saveConfig}
          tint="green"
          disabled={
            !configChanged ||
            store.subdomainAvailabilityStatus !== 'available' ||
            store.configIsSaving
          }
        >
          {store.configIsSaving ? 'Guardando...' : 'Guardar'}
        </Button>
        <Button
          tint="green"
          disabled={configChanged || store.deploySiteInProgress || !publishedConfigIsDifferent}
          expandH
          onClick={handleDeploySite}
        >
          {store.deploySiteInProgress
            ? 'Publicando...'
            : deploySiteResult
              ? 'Publicar'
              : 'Error. Reintentar?'}
        </Button>
        <div
          class={cx('sm:hidden pt[1px] z-50 -mx4 fixed bottom-0 ', {
            'bg-gray-600 shadow-md w-full': !previewing,
          })}
        >
          {previewing ? (
            <Button tint="teal" class="ml1 mb1 w7 h7" customSize onClick={() => _previewing(false)}>
              &larr;
            </Button>
          ) : (
            <Button
              joinL
              joinR
              tint="teal"
              align="right"
              class="w-full"
              onClick={() => _previewing(true)}
            >
              Ver &rarr;
            </Button>
          )}
        </div>
      </div>
      <div
        class={cx('flex-grow sm:(inset-none! block! relative! overflow-none!) bg-white z-40', {
          'fixed inset-0 block overflow-auto': previewing,
          'hidden ': !previewing,
        })}
      >
        <App />
      </div>
    </div>
  );
}

const Separator = (p: { children: any }) => (
  <div class="text-center text-xl px-4">{p.children}</div>
);
