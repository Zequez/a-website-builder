import { useEffect, useState } from 'preact/hooks';
import useAdminStore from './useAdminStore';
import SignIn from './SignIn';
import Tools from './Tools';

export default function Admin() {
  const { store } = useAdminStore();

  return (
    <div class="bg-emerald-500 min-h-screen text-white/80">
      {store.accessKeyToken ? <Tools /> : <SignIn />}
    </div>
  );
}
