import { query as Q } from './pool';
import { groupBy } from '@shared/utils';

import { updateFileToB64 } from '../lib/utils.js';
import { Member, Site, File_, Blob_, TSite } from './types';
import { sql, spreadAnd, spreadUpdate, spreadInsert } from './squid';
import { Prerendered, Tsites } from './schema';

export { sql, Q };
export const query = Q;

export async function QQ<T>(strings: TemplateStringsArray, ...values: any) {
  return await Q<T>(sql(strings, ...values));
}

function select<T>(table: string) {
  const TA = sql.raw(table);
  return {
    one: async (): Promise<T | null> => (await Q<T>(sql`SELECT * FROM ${TA} LIMIT 1`))[0] || null,
    all: async (): Promise<T[]> => await Q(sql`SELECT * FROM ${TA}`),
    get: async (id: number | string): Promise<T | null> =>
      (await Q<T>(sql`SELECT * from ${TA} WHERE id = ${id} LIMIT 1`))[0] || null,
    find: async (id: number | string): Promise<T> => {
      const record = (await Q<T>(sql`SELECT * from ${TA} WHERE id = ${id} LIMIT 1`))[0];
      if (!record) throw 'Record not found';
      return record;
    },
    insert: async (keyValues: Record<string, any>): Promise<T> =>
      (await Q<T>(sql`INSERT INTO ${TA} ${spreadInsert(keyValues)} RETURNING *`))[0],
    update: async (id: number | string, keyValues: Record<string, any>): Promise<T> =>
      (
        await Q<T>(sql`UPDATE ${TA} SET ${spreadUpdate(keyValues)} WHERE id = ${id} RETURNING *`)
      )[0],
    delete: async (id: number | string) => await Q(sql`DELETE FROM ${TA} WHERE id = ${id}`),
    where: (keyValues: Record<string, any>) => {
      return {
        all: async (): Promise<T[]> =>
          await Q(sql`SELECT * FROM ${TA} WHERE ${spreadAnd(keyValues)}`),
        one: async (): Promise<T | null> =>
          (await Q<T>(sql`SELECT * FROM ${TA} WHERE ${spreadAnd(keyValues)} LIMIT 1`))[0] || null,
        delete: async () => await (Q(sql`DELETE FROM ${TA} WHERE ${spreadAnd(keyValues)}`) as any),
      };
    },
    truncate: async () => await Q(sql`TRUNCATE TABLE ${TA} RESTART IDENTITY CASCADE`),
  };
}

const members = select<Member>('members');
const sites = select<Site>('sites');
const files = select<File_>('files');
const blobs = select<Blob_>('blobs');
const tsites = select<Tsites>('tsites');
const prerendered = select<Prerendered>('prerendered');

export type FileB64 = Omit<File_, 'data' | 'data_size'> & {
  data: string;
  data_size: number;
};
export type SiteWithFiles = Site & { files: FileB64[] };

const extendedMembers = {
  ...members,
  withSites: async (id: string) => {
    const member = await T.members.get(id);
    if (!member) return null;
    const sites = await T.sites.where({ member_id: member.id }).all();
    const sitesIds = sites.map((s) => s.id);
    const files = (await Q(
      sql`SELECT * FROM files WHERE site_id IN (${sql.raw(
        sitesIds.map((i) => `'${i}'`).join(','),
      )})`,
    )) as File_[];
    const editedFiles = files.map(updateFileToB64);
    const filesBySiteId = groupBy(editedFiles, 'site_id');
    (sites as SiteWithFiles[]).forEach((s) => (s.files = filesBySiteId[s.id] || []));
    return { ...member, sites };
  },
  isUnique: async (
    id: number | string | null,
    col: 'email' | 'telegram_handle' | 'tag',
    val: string,
  ) => {
    return !(
      await Q(
        id
          ? sql`SELECT * FROM members WHERE ${sql.raw(col)} = ${val} AND id != ${id} LIMIT 1`
          : sql`SELECT * FROM members WHERE ${sql.raw(col)} = ${val} LIMIT 1`,
      )
    )[0];
  },
};

const extendedFiles = {
  ...files,
  findExisting: async (siteId: string, name: string): Promise<File_ | null> => {
    return (
      (
        await Q<File_>(
          sql`SELECT * FROM files WHERE is_dist = FALSE AND site_id = ${siteId} AND name ILIKE ${name}`,
        )
      )[0] || null
    );
  },
  findByMemberId: async (memberId: string) => {
    return await Q<File_>(
      sql`SELECT * FROM files WHERE is_dist = FALSE AND site_id IN (SELECT id FROM sites WHERE member_id = ${memberId})`,
    );
  },
};

export const T = {
  members: extendedMembers,
  sites,
  files: extendedFiles,
  blobs,
  tsites,
  prerendered,
};
