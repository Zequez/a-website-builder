import { TSite } from '@db';
import { useState } from 'preact/hooks';
import PlusIcon from '~icons/fa6-solid/plus';
import { Link, Button, TextInput } from '../ui';
import useAdminStore from './useAdminStore';

export default function Tools() {
  const {
    store: { sites },
  } = useAdminStore();

  return (
    <div>
      <h1 class="text-3xl mb4">Herramientas de Administración</h1>
      <div class="flex flex-col space-y-2">
        {sites && sites.map((s) => <SiteControl site={s} />)}
        <div class="flexcc">
          <Button>
            <PlusIcon class="mr-2" /> Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}

function SiteControl(p: { site: Partial<TSite> }) {
  const { actions: A } = useAdminStore();
  const [accessKey, setAccessKey] = useState('');
  const [domain, setDomain] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [settingAccessKey, setSettingAccessKey] = useState(false);

  async function handleSetAccessKey() {
    setSettingAccessKey(true);
    if (await A.setAccessKey(p.site.id!, accessKey)) {
      setAccessKey('');
    }
    setSettingAccessKey(false);
  }

  return (
    <div class="bg-white/20 rounded-md p4">
      <div class="text-2xl">
        {p.site.name}
        <span class="text-sm ml2">{p.site.id}</span>
      </div>
      <div class="font-bold mb4 text-xl">
        <Link href="" openNewPage>
          Visitar
        </Link>
        <span class="mx2">•</span>
        <Link href="" openNewPage>
          Abrir en editor
        </Link>
      </div>
      <div class="flex space-x-4 mb4">
        <TextInput label="Subdominio" value={subdomain} onChange={setSubdomain} />
        <TextInput label="Dominio" value={domain} onChange={setDomain} />
        <Button>Establecer</Button>
      </div>
      <div class="flex space-x-2">
        <div class="w-40">
          <TextInput label="Clave de acceso" value={accessKey} onChange={setAccessKey} />
        </div>
        <Button disabled={!accessKey || settingAccessKey} onClick={handleSetAccessKey}>
          {settingAccessKey ? 'Estableciendo...' : 'Establecer'}
        </Button>
        <div class="flex-grow"></div>
        <Button tint="red">Eliminar</Button>
      </div>
    </div>
  );
}
