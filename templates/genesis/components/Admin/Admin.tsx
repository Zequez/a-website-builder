import { useEffect, useState } from 'preact/hooks';
import useAdminStore from './useAdminStore';
import SignIn from './SignIn';
import Tools from './Tools';

export default function Admin() {
  const { store } = useAdminStore();

  return (
    <div class="bg-emerald-500 h-screen p-4 text-white/80">
      {store.accessKeyToken ? <Tools /> : <SignIn />}
    </div>
  );
}
