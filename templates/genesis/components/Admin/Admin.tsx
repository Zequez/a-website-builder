import { useEffect, useState } from 'preact/hooks';
import useAdminStore from './useAdminStore';
import SignIn from './SignIn';
import { TSite } from '@db';
import TextInput from '../TextInput';

export default function Admin() {
  const { store } = useAdminStore();

  return (
    <div class="bg-emerald-500 h-screen p-4 text-white/80">
      {store.accessKeyToken ? <AdminTools /> : <SignIn />}
    </div>
  );
}

function AdminTools() {
  const {
    store: { sites },
  } = useAdminStore();

  return (
    <div>
      <h1 class="text-3xl mb4">Admin tools</h1>
      <div class="flex flex-col space-y-2">
        {sites && sites.map((s) => <SiteControl site={s} />)}
        <button class="px2 py1 rounded-md bg-white/20 hover:bg-white/30">Add site</button>
      </div>
    </div>
  );
}

function SiteControl(p: { site: Partial<TSite> }) {
  const [accessKey, setAccessKey] = useState('');
  return (
    <div class="bg-white/20 rounded-md p4 flex flex-col space-y-2">
      <div class="text-2xl">
        {p.site.name}
        <span class="text-sm ml2">{p.site.id}</span>
      </div>
      <div class="font-bold">
        <a class="underline text-sky-500" href="" target="_blank">
          Visit
        </a>{' '}
        |{' '}
        <a class="underline text-sky-500" href="" target="_blank">
          Open Editor
        </a>
      </div>
      <div class="flex space-x-4">
        <TextInput label="Subdomain" value={accessKey} onChange={setAccessKey} />
        <TextInput label="Domain" value={accessKey} onChange={setAccessKey} />
        <button class="bg-white/20 hover:bg-white/30 px2 py1 min-w-20 rounded-md">Set</button>
      </div>
      <div class="flex space-x-2">
        <div class="w-40">
          <TextInput label="Access key" value={accessKey} onChange={setAccessKey} />
        </div>
        <button class="bg-white/20 hover:bg-white/30 px2 py1 min-w-20 rounded-md">Set</button>
      </div>
      <div>
        <button class="bg-red/50 hover:bg-red/60 px2 py1 rounded-md">Delete site</button>
      </div>
    </div>
  );
}
