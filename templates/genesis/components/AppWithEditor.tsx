import useStore from '../lib/useStore';
import App from './App';
import { TextInput, TextAreaInput, Button } from './ui';
import { cx } from '@shared/utils';
import PagesList from './PagesList';
import EditorPreScreen from './EditorPreScreen';
import { useState } from 'preact/hooks';

export default function AppWithEditor() {
  const { store, configChanged, subdomainChanged, showPreScreen, actions: A } = useStore();

  function saveConfig() {
    A.saveConfig();
  }

  const [deploySiteResult, setDeploySiteResult] = useState(true);
  async function handleDeploySite() {
    setDeploySiteResult(await A.deploySite());
  }

  const C = store.config;

  if (showPreScreen) return <EditorPreScreen />;

  return (
    <div class="h-screen w-screen flex">
      <div class="w-60 bg-gray-800 text-white flex-shrink-0 flex flex-col pb4  overflow-auto">
        <Separator>Sitio</Separator>
        <div class="flexcc mb4 px-4">
          <TextInput
            label="Titulo"
            value={C.title}
            onChange={(val) => A.setConfigVal('title', val)}
          />
        </div>
        <div class="px4 mb4">
          <TextAreaInput
            label="Descripción"
            value={C.description}
            onChange={(val) => A.setConfigVal('description', val)}
          />
        </div>
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
        <div class="flexcc mb2 px-4">
          <TextInput
            label="Subdominio"
            value={C.subdomain}
            onChange={(val) => A.setConfigVal('subdomain', val)}
          />
        </div>
        <div class="flexcc mb2 px-4">
          <select
            disabled={true}
            onChange={(val) => A.setConfigVal('domain', val)}
            class="w-full text-black/70 rounded-md py2 px2 h-10"
          >
            <option value="hoja.ar">.{C.domain}</option>
          </select>
        </div>
        <div class="px4">
          {store.subdomainAvailabilityStatus === 'unknown' && (
            <div class="mb2">Checkeando disponibilidad...</div>
          )}
          {store.subdomainAvailabilityStatus === 'available' && subdomainChanged && (
            <div class="mb2">Subdominio disponible</div>
          )}
          {store.subdomainAvailabilityStatus === 'taken' && (
            <div class="text-center text-red-500 mb2">Subdominio no disponible</div>
          )}
        </div>
        <div class="px4 flex flex-col space-y-2">
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
            disabled={store.deploySiteInProgress}
            expandH
            onClick={handleDeploySite}
          >
            {store.deploySiteInProgress
              ? 'Publicando...'
              : deploySiteResult
                ? 'Publicar'
                : 'Error. Reintentar?'}
          </Button>
        </div>
      </div>
      <div class={cx('flex-grow hidden sm:block')}>
        <App />
      </div>
    </div>
  );
}

const Separator = (p: { children: any }) => (
  <div class="text-center text-xl py-2 px-4">{p.children}</div>
);

// function PagesDragSpace(p: { children: any }) {
//   const
// }
