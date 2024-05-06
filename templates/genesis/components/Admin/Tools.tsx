import { useMemo, useState } from 'preact/hooks';
import PlusIcon from '~icons/fa6-solid/plus';
import { Link, Button, TextInput } from '../ui';
import useAdminStore, { PartialSite } from './useAdminStore';
import { ValidationError } from '../../config-validator';
import ErrorsListDisplay from '../ui/ErrorsListDisplay';
import { editorUrl, publicSiteUrl } from '../../lib/url-helpers';

export default function Tools() {
  const {
    store: { sites, createSiteInProgress, createSiteErrors },
    actions: A,
  } = useAdminStore();

  const sortedSites = useMemo(() => {
    return (
      sites &&
      [...sites].sort((a, b) =>
        a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()),
      )
    );
  }, [sites]);

  return (
    <div>
      <h1 class="text-3xl mb4">Herramientas de Administración</h1>
      <div class="flex flex-col space-y-4">
        {sortedSites && sortedSites.map((s) => <SiteControl key={s.id} site={s} />)}
        <div class="flexcc">
          <ErrorsListDisplay class="w-full" errors={createSiteErrors} />
          <Button onClick={A.createSite}>
            <PlusIcon class="mr-2" /> {createSiteInProgress ? 'Agregando...' : 'Agregar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SiteControl(p: { site: PartialSite }) {
  const { actions: A } = useAdminStore();

  const [accessKey, setAccessKey] = useState('');
  const [setAccessKeyInProgress, _setAccessKeyInProgress] = useState(false);
  async function handleSetAccessKey() {
    _setAccessKeyInProgress(true);
    if (await A.setAccessKey(p.site.id!, accessKey)) {
      setAccessKey('');
    }
    _setAccessKeyInProgress(false);
  }

  const [site, _site] = useState(p.site);
  const [saveSiteErrors, _saveSiteErrors] = useState<ValidationError[]>([]);
  const [saveSiteInProgress, _saveSiteInProgress] = useState(false);

  function patchSite(patch: Partial<PartialSite>) {
    _site({ ...site, ...patch });
  }

  const saveable = useMemo(() => JSON.stringify(site) !== JSON.stringify(p.site), [site, p.site]);

  async function handleSave() {
    if (saveable) {
      _saveSiteInProgress(true);
      const { errors } = await A.saveSite(site);
      _saveSiteErrors(errors);
      _saveSiteInProgress(false);
    }
  }

  return (
    <div class="bg-white/20 rounded-md p4">
      <div class="text-2xl mb2">
        <input
          value={site.name}
          class="bg-transparent w-full"
          onChange={({ currentTarget }) => patchSite({ name: currentTarget.value })}
        />
        <div class="text-xs">{p.site.id}</div>
      </div>
      <div class="font-bold mb4 text-xl">
        <Link href={publicSiteUrl(p.site.id, '/', p.site.subdomain)} openNewPage>
          Visitar
        </Link>
        <span class="mx2">•</span>
        <Link href={editorUrl(p.site.id, '/')} openNewPage>
          Abrir en editor
        </Link>
      </div>
      <div class="flex flex-col space-y-4 sm:(flex-row space-x-4 space-y-0 ) mb4 ">
        <TextInput
          label="Subdominio"
          value={site.subdomain}
          onChange={(subdomain) => patchSite({ subdomain })}
        />
        <TextInput
          label="Dominio"
          disabled={true}
          value={site.domain}
          onChange={(domain) => patchSite({ domain })}
        />
      </div>
      <div class="flex mb4">
        <TextInput label="Clave acceso" value={accessKey} onChange={setAccessKey} joinR />
        <Button
          joinL
          disabled={!accessKey || setAccessKeyInProgress}
          onClick={handleSetAccessKey}
          class="flex-shrink-0"
        >
          {setAccessKeyInProgress ? 'Estableciendo...' : 'Establecer'}
        </Button>
      </div>
      <ErrorsListDisplay errors={saveSiteErrors} class="mb4" />
      <div class="flex flex-col space-y-4 sm:(flex-row space-x-4 space-y-0)">
        <Button
          class="flex-shrink-0"
          tint="green-brighter"
          onClick={handleSave}
          disabled={!saveable}
        >
          {saveSiteInProgress ? 'Guardando...' : 'Guardar'}
        </Button>
        <div class="contents sm:block flex-grow"></div>
        <Button tint="red">Eliminar</Button>
      </div>
    </div>
  );
}
