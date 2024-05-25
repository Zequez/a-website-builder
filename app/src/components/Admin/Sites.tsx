import PlusIcon from '~icons/fa6-solid/plus';
import GlobeIcon from '~icons/fa6-solid/globe';
import PencilIcon from '~icons/fa6-solid/pencil';
import UnlockIcon from '~icons/fa6-solid/unlock';
import CheckIcon from '~icons/fa6-solid/check';
import MinusIcon from '~icons/fa6-solid/minus';
import { useMemo, useState } from 'preact/hooks';
import useAdminStore, { PartialSite } from './useAdminStore';
import { Button, Link, TextInput } from '../ui';
import ErrorsListDisplay from '../ui/ErrorsListDisplay';
import { ValidationError } from '../../config-validator';
import { editorUrl, publicSiteUrl } from '../../lib/url-helpers';
import ThreeDots from '../ui/ThreeDots';
import { cx } from '@shared/utils';
import { prodDomains, devDomains } from '@server/domains';

const domains = import.meta.env.DEV ? devDomains : prodDomains;

export default function Sites() {
  const {
    store: { inProgress, errors },
    computed: { deletedSites, activeSites },
    actions: A,
  } = useAdminStore();

  const sortedSites = useMemo(() => {
    return (
      activeSites &&
      [...activeSites].sort((a, b) =>
        a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()),
      )
    );
  }, [activeSites]);

  return (
    <div class="flex flex-col md:(space-y-4 pt-4)">
      {sortedSites && sortedSites.map((s) => <SiteControl key={s.id} site={s} />)}
      <div class="flexcc">
        <ErrorsListDisplay class="w-full" errors={errors.createSite} />
        <Button onClick={A.createSite} disabled={inProgress.createSite} class="shadow-md! my4">
          <PlusIcon class="mr-2" /> {inProgress.createSite ? 'Agregando...' : 'Agregar'}
        </Button>
      </div>
      {deletedSites?.length ? (
        <div>
          <div class="space-y-1 bg-white/20 py4 b b-black/20 md:(shadow-md rounded-md mb4) ">
            <h1 class="text-2xl mb4 text-center">Sitios eliminados</h1>
            {deletedSites.map((site) => (
              <div class="flexcs space-x-2 p1 px4 hover:bg-white/10">
                <div class="flex-grow">
                  <div>{site.name}</div>
                  <span class="text-white/50 text-xs">{site.id}</span>
                </div>
                <Button
                  disabled={inProgress.deleteSiteForGood}
                  tint="red"
                  onClick={() => {
                    confirm(`Esta acción es irreversible. ¿Confirmar?`) &&
                      A.deleteSiteForGood(site.id!);
                  }}
                >
                  Destruir
                </Button>
                <Button
                  tint="green-brighter"
                  disabled={inProgress.restoreSite}
                  onClick={() => A.restoreSite(site.id!)}
                >
                  Restaurar
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SiteControl(p: { site: PartialSite }) {
  const {
    actions: A,
    store: { inProgress },
  } = useAdminStore();

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

  const [changeKeyOpen, setChangeKeyOpen] = useState(false);

  return (
    <div
      class={cx('bg-white/20 p4 b b-black/20 md:(shadow-md rounded-md)', {
        'b-4! b-emerald-700!': !p.site.subdomain && !p.site.domain.startsWith('.'),
      })}
    >
      <div class="text-2xl mb2 flex">
        <div class="flex-grow">
          <input
            value={site.name}
            class="bg-transparent w-full"
            onChange={({ currentTarget }) => patchSite({ name: currentTarget.value })}
          />
          <div class="text-xs">{p.site.id}</div>
        </div>
        <div class="font-bold mb4 text-lg flex">
          <Button
            customSize
            class="p2"
            href={publicSiteUrl(p.site.id, '/', p.site.subdomain)}
            joinR
            openNewPage
          >
            <GlobeIcon />
          </Button>
          <Button customSize class="p2" href={editorUrl(p.site.id, '/')} joinL openNewPage>
            <PencilIcon />
          </Button>
        </div>
      </div>

      <div class="flex mb4 ">
        <TextInput
          label="Subdominio"
          joinR
          value={site.subdomain}
          onChange={(subdomain) => patchSite({ subdomain })}
        />
        <select
          onChange={({ currentTarget }) => patchSite({ domain: currentTarget.value })}
          value={site.domain}
          class="text-black/70 rounded-r-md py2 px2 h-10 flex-shrink-0 outline-slate-4"
        >
          {domains.map((domain) => {
            return (
              <option value={domain.host}>
                {domain.subdomains ? '*' : ''}
                {domain.host}
              </option>
            );
          })}
        </select>
      </div>
      <ErrorsListDisplay errors={saveSiteErrors} class="mb4" />
      <div class="flex space-x-4">
        {changeKeyOpen ? (
          <div class="flex">
            <TextInput label="Clave acceso" value={accessKey} onChange={setAccessKey} joinR focus />
            <Button
              joinL
              customSize
              tint={accessKey ? 'green-brighter' : ''}
              disabled={setAccessKeyInProgress}
              onClick={accessKey ? handleSetAccessKey : () => setChangeKeyOpen(false)}
              class="flex-shrink-0 px2"
            >
              {setAccessKeyInProgress ? (
                <div class="w-6">
                  <ThreeDots />
                </div>
              ) : accessKey ? (
                <CheckIcon />
              ) : (
                <MinusIcon />
              )}
            </Button>
          </div>
        ) : (
          <Button customSize onClick={() => setChangeKeyOpen(true)} class="flex-shrink-0 px4">
            <UnlockIcon />
          </Button>
        )}
        <div class="flex-grow"></div>
        <Button tint="red" disabled={inProgress.deleteSite} onClick={() => A.deleteSite(site.id)}>
          Archivar
        </Button>
        <Button
          class="flex-shrink-0"
          tint="green-brighter"
          onClick={handleSave}
          disabled={!saveable}
        >
          {saveSiteInProgress ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}
