import './base';
import { render } from 'preact';
import Admin from '../components/Admin';
import { AdminStoreContextWrapper } from '../components/Admin/useAdminStore';

render(
  <AdminStoreContextWrapper init={{}}>
    <Admin />
  </AdminStoreContextWrapper>,
  document.getElementById('root')!,
);
