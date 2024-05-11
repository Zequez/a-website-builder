import { QQ } from '@db';
import { Tsites } from '@db/schema';

export async function up() {
  await QQ<Tsites>`UPDATE tsites SET domain = '.hoja.ar';`;
}

export async function down() {
  await QQ``;
}
