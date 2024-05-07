import { T, QQ, sql, TSite, Member } from '@db';
import { ValidationError, valErr, validateConfig } from '../../templates/genesis/config-validator';
import Token from '@server/lib/Token';
import { hashPass, hashCompare } from '@server/lib/passwords';
import { Prerendered, Tsites } from '@db/schema';
import { spreadInsert } from '@db/squid';
import { randomAlphaNumericString } from '@shared/utils';

export class Err extends Error {
  constructor(
    message: string,
    public status: number,
    public data: any,
  ) {
    super(message);
    this.name = 'ErrorWithStatusAndData';
    this.status = status;
    this.data = data;
  }
}

function E(message: string, status: number, data: any) {
  return new Err(message, status, data);
}

export class Functions {
  constructor() {}

  // ███████╗██╗  ██╗ █████╗ ██████╗ ███████╗██████╗
  // ██╔════╝██║  ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗
  // ███████╗███████║███████║██████╔╝█████╗  ██║  ██║
  // ╚════██║██╔══██║██╔══██║██╔══██╗██╔══╝  ██║  ██║
  // ███████║██║  ██║██║  ██║██║  ██║███████╗██████╔╝
  // ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝

  //  +-+-+-+-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+
  //  |A|U|T|H|O|R|I|Z|A|T|I|O|N| |H|E|L|P|E|R|S|
  //  +-+-+-+-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+

  async memberAuthorizeOnly(token: string) {
    const tokenData = Token.verifyAndGetPayload(token);
    if (!tokenData) throw E('Unauthorized', 401, null);
    if (tokenData.type !== 'member') throw E('Unauthorized', 401, null);
    return tokenData;
  }

  async memberAuthorized(token: string) {
    const { memberId } = await this.memberAuthorizeOnly(token);
    const member = await T.members.get(memberId);
    if (!member) throw E('Unauthorized', 401, null);
    return member;
  }

  async adminMemberAuthorized(token: string) {
    const tokenData = await this.memberAuthorizeOnly(token);

    const adminMember = (
      await QQ<Member>`SELECT * FROM members WHERE id = ${tokenData.memberId} AND is_admin = TRUE`
    )[0];
    if (!adminMember) throw E('Unauthorized', 401, null);
    return adminMember;
  }

  async accessKeyAuthorizeOnly(token: string, siteId: string) {
    const tokenData = Token.verifyAndGetPayload(token);
    if (!tokenData) throw E('Unauthorized', 401, null);
    // For admin members allow to edit any site
    if (tokenData.type === 'member') {
      if (await this.isAdminMember(tokenData.memberId)) {
        return tokenData;
      } else {
        // TODO: Allow members to own multiple sites and do the check here
      }
    } else if (tokenData.type === 'access-key') {
      if (tokenData.siteId !== siteId) throw E('Unauthorized', 401, null);
    }
    return tokenData;
  }

  async isAdminMember(id: number | string) {
    return !!(await QQ<Member>`SELECT * FROM members WHERE id = ${id} AND is_admin = TRUE`)[0];
  }

  //  +-+-+ +-+-+-+-+-+-+-+
  //  |D|B| |H|E|L|P|E|R|S|
  //  +-+-+ +-+-+-+-+-+-+-+

  async getSite(siteId: string, props: string[]): Promise<Partial<TSite> | null> {
    if (!props.length) throw E('No valid properties selected', 400, null);
    const tsite = (
      await QQ<Partial<TSite>>`SELECT ${sql.raw(props.join(', '))} FROM tsites WHERE id = ${siteId}`
    )[0];
    return tsite || null;
  }

  // ██╗   ██╗ █████╗ ██╗     ██╗██████╗  █████╗ ████████╗██╗ ██████╗ ███╗   ██╗███████╗
  // ██║   ██║██╔══██╗██║     ██║██╔══██╗██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
  // ██║   ██║███████║██║     ██║██║  ██║███████║   ██║   ██║██║   ██║██╔██╗ ██║███████╗
  // ╚██╗ ██╔╝██╔══██║██║     ██║██║  ██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║╚════██║
  //  ╚████╔╝ ██║  ██║███████╗██║██████╔╝██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║███████║
  //   ╚═══╝  ╚═╝  ╚═╝╚══════╝╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  tsiteSanitizedProps(props: string[], allowed: string[]) {
    return props.filter((c) => allowed.indexOf(c) !== -1);
  }

  //  ██████╗ ███████╗████████╗████████╗███████╗██████╗ ███████╗
  // ██╔════╝ ██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗██╔════╝
  // ██║  ███╗█████╗     ██║      ██║   █████╗  ██████╔╝███████╗
  // ██║   ██║██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗╚════██║
  // ╚██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║███████║
  //  ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝

  async $tsite(p: { siteId: string; props: string[] }): Promise<Partial<TSite> | null> {
    const selectProps = this.tsiteSanitizedProps(p.props, [
      'id',
      'config',
      'name',
      'subdomain',
      'domain',
    ]);
    if (selectProps.length === 0) {
      throw E('No valid properties selected', 400, null);
    }
    return await this.getSite(p.siteId, selectProps);
  }

  //  +-+-+-+-+-+-+-+-+
  //  |C|H|E|C|K|E|R|S|
  //  +-+-+-+-+-+-+-+-+

  async $checkSubdomainAvailability(p: { subdomain: string; siteId?: string }): Promise<boolean> {
    console.log('Checking SUBDOMAIN', p.subdomain, p.siteId);
    console.log(await QQ`SELECT id, name, subdomain FROM tsites;`);
    const tsite = (
      await QQ`SELECT id, name FROM tsites WHERE subdomain = ${p.subdomain} AND id != ${p.siteId || null}`
    )[0];
    if (tsite) return false;
    return true;
  }

  //  +-+-+-+-+-+
  //  |A|D|M|I|N|
  //  +-+-+-+-+-+

  async $adminTsites(p: { props: string[]; token: string }): Promise<Partial<Tsites>[]> {
    await this.adminMemberAuthorized(p.token);
    const selectProps = this.tsiteSanitizedProps(p.props, [
      'id',
      'config',
      'name',
      'subdomain',
      'domain',
      'deleted_at',
    ]);
    if (!selectProps.length) throw E('No valid properties selected', 400, null);
    const tsites = await QQ<Partial<Tsites>>`SELECT ${sql.raw(selectProps.join(', '))} FROM tsites`;
    return tsites;
  }

  //  █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
  // ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
  // ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
  // ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
  // ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
  // ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  async $deploySite(p: {
    siteId: string;
    deployConfig: Config;
    prerenderedPages: { content: string; path: string }[];
    token: string;
  }): Promise<boolean> {
    await this.accessKeyAuthorizeOnly(p.token, p.siteId);
    const errors = validateConfig(p.deployConfig);
    if (errors.length > 0) return false;
    if (!p.prerenderedPages || !Array.isArray(p.prerenderedPages)) return false;
    p.prerenderedPages.forEach((p) => {
      if (!p.content || !p.path) return false;
    });

    const subdomain = p.deployConfig.subdomain;

    if (!(await this.$checkSubdomainAvailability({ subdomain, siteId: p.siteId }))) {
      return false;
    }

    await QQ`UPDATE tsites
      SET
        subdomain = ${subdomain},
        deploy_config = ${p.deployConfig},
        deployed_at = now()
      WHERE id = ${p.siteId};`;
    await QQ`DELETE FROM prerendered WHERE tsite_id = ${p.siteId};`;
    await QQ`INSERT INTO prerendered ${spreadInsert(
      ...p.prerenderedPages.map(({ path, content }) => ({ tsite_id: p.siteId, path, content })),
    )};`;
    return true;
  }

  async $tsiteSetConfig(p: {
    siteId: string;
    config: Config;
    token: string;
  }): Promise<{ errors: ValidationError[] }> {
    await this.accessKeyAuthorizeOnly(p.token, p.siteId);
    const tsite = (await QQ<Pick<Tsites, 'id'>>`SELECT id FROM tsites WHERE id = ${p.siteId}`)[0];
    if (!tsite) return { errors: [valErr('Site not found')] };
    const errors = validateConfig(p.config);
    if (errors.length > 0) return { errors };
    else {
      await T.tsites.update(p.siteId, { config: p.config, updated_at: new Date() });
      return { errors: [] };
    }
  }

  //  +-+-+-+-+-+
  //  |A|D|M|I|N|
  //  +-+-+-+-+-+

  async $setAccessKey(p: { siteId: string; accessKey: string; token: string }): Promise<boolean> {
    try {
      await this.adminMemberAuthorized(p.token);
      const hashedPass = await hashPass(p.accessKey);
      await QQ`UPDATE tsites SET access_key = ${hashedPass} WHERE id = ${p.siteId}`;
      return true;
    } catch (e) {
      return false;
    }
  }

  async $adminSaveSite(p: {
    siteId: string;
    site: { name?: string; subdomain?: string; domain?: string };
    token: string;
  }) {
    await this.adminMemberAuthorized(p.token);
    if (p.site.subdomain) {
      if (!(await this.setSubdomain({ siteId: p.siteId, subdomain: p.site.subdomain }))) {
        return { errors: [valErr('Subdomain not available', 'subdomain')] };
      }
    }
    const update = {
      ...(p.site.name !== undefined && { name: p.site.name }),
      ...(p.site.domain !== undefined && { domain: p.site.domain }),
    };
    if (Object.keys(update).length) {
      await T.tsites.update(p.siteId, update);
    }
    return { errors: [] };
  }

  async setSubdomain(p: { siteId: string; subdomain?: string }) {
    const tsite = (
      await QQ<Tsites>`SELECT id, config, deploy_config FROM tsites WHERE id = ${p.siteId}`
    )[0];
    if (!p.subdomain) return false;
    if (!tsite) return false;
    if (p.subdomain) {
      if (!(await this.$checkSubdomainAvailability({ subdomain: p.subdomain, siteId: p.siteId }))) {
        return false;
      }
    }

    await QQ`
      UPDATE tsites
      SET
        subdomain = ${p.subdomain},
        config = jsonb_set(config, '{subdomain}', to_jsonb(${p.subdomain}::text)),
        updated_at = now(),
        deploy_config = jsonb_set(deploy_config, '{subdomain}', to_jsonb(${p.subdomain}::text))
      WHERE id = ${p.siteId};
    `;
    return true;
  }

  async $adminCreateSite(p: { token: string; site: { name: string; config: Config } }): Promise<{
    errors: ValidationError[];
    site: Pick<Tsites, 'id' | 'name' | 'subdomain' | 'domain' | 'deleted_at'> | null;
  }> {
    await this.adminMemberAuthorized(p.token);

    if (!p.site) return { errors: [valErr('Missing site', 'site')], site: null };
    if (!p.site.config) return { errors: [valErr('Missing config', 'config')], site: null };
    if (!p.site.name) return { errors: [valErr('Missing name', 'name')], site: null };

    const errors = validateConfig(p.site.config);
    if (errors.length) {
      return { errors, site: null };
    }

    const subdomain = p.site.config.subdomain;
    if (!(await this.$checkSubdomainAvailability({ subdomain }))) {
      return { errors: [valErr('Subdomain not available', 'subdomain')], site: null };
    }

    const domain = 'hoja.ar';
    p.site.config.domain = domain;
    const { id } = await T.tsites.insert({
      name: p.site.name,
      config: p.site.config,
      subdomain,
      domain,
      template: 'genesis',
      access_key: await hashPass(randomAlphaNumericString()),
    });

    return { errors: [], site: { id, name: p.site.name, subdomain, domain, deleted_at: null } };
  }

  async $adminDeleteSite(p: { token: string; siteId: string }) {
    await this.adminMemberAuthorized(p.token);
    await QQ`UPDATE tsites SET deleted_at = now(), subdomain = '', domain = '' WHERE id = ${p.siteId}`;
    await QQ`DELETE FROM prerendered WHERE tsite_id = ${p.siteId}`;
  }

  async $adminRestoreSite(p: { token: string; siteId: string }) {
    await this.adminMemberAuthorized(p.token);
    await QQ`UPDATE tsites SET
      deleted_at = null,
      domain = 'hoja.ar',
      subdomain = ${randomAlphaNumericString()}
    WHERE id = ${p.siteId}`;
  }

  async $adminDeleteSiteForGood(p: { token: string; siteId: string }) {
    await this.adminMemberAuthorized(p.token);
    await QQ`DELETE FROM tsites WHERE id = ${p.siteId}`;
  }

  //  +-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+
  //  |T|O|K|E|N|S| |G|E|N|E|R|A|T|I|O|N|
  //  +-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+

  async $tokenFromAccessKey(p: { siteId: string; plainAccessKey: string }): Promise<string | null> {
    const tsite = await this.getSite(p.siteId, ['access_key']);
    if (!tsite) {
      return null;
    }

    const isValid = await hashCompare(p.plainAccessKey, tsite.access_key!);

    return isValid ? Token.generate({ siteId: p.siteId, type: 'access-key' }) : null;
  }

  async $tokenFromMemberCredentials(p: { email: string; password: string }) {
    const member = await T.members.where({ email: p.email }).one();
    if (!member) return null;
    const isValid = await hashCompare(p.password, member.passphrase);
    if (!isValid) return null;
    return Token.generate({ memberId: member.id, type: 'member' });
  }
}

// type MemberWithTagOnly = { id: number; tag: string };

// async membersWithSharedResources(): Promise<MemberWithTagOnly[]> {
//   const members = await QQ<MemberWithTagOnly>`SELECT id, tag FROM members WHERE tag IS NOT NULL`;
//   const sitesMembers = await QQ<{
//     member_id: number;
//   }>`SELECT DISTINCT member_id FROM files WHERE site_id IS NULL`;
//   const membersWithSharedResources: MemberWithTagOnly[] = [];
//   sitesMembers.forEach(({ member_id }) => {
//     const member = members.find((m) => m.id === member_id);
//     if (member?.tag) membersWithSharedResources.push(member);
//   });
//   return membersWithSharedResources;
// }

// async sharedResourcesByMemberId(p: { memberId: number }): Promise<FileB64[]> {
//   return (
//     await QQ<File_>`SELECT * FROM files WHERE member_id = ${p.memberId} AND is_dist = FALSE AND site_id IS NULL`
//   ).map(updateFileToB64);
// }

// async memberSites(p: { memberId: number }): Promise<Site[]> {
//   return await T.sites.where({ member_id: p.memberId }).all();
// }

// async siteFiles(p: { siteId: string }): Promise<FileB64[]> {
//   return (await T.files.where({ site_id: p.siteId, is_dist: false }).all()).map(updateFileToB64);
// }
