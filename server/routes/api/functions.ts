import { T, QQ, Q, sql, File_, Site, FileB64, TSite, Member } from '@db';
import {
  TokenMember,
  hashCompare,
  sanitizeMember,
  updateFileToB64,
  validateTokenExpiry,
  verifiedTokenFromHeader,
} from '@server/lib/utils';
import { Request } from 'express';
import {
  ValidationError,
  valErr,
  validateConfig,
} from '../../../templates/genesis/config-validator';
import Token from '@server/lib/Token';

export class Err extends Error {
  constructor(message: string, public status: number, public data: any) {
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
  constructor(public maybeTokenMember: TokenMember | null) {
    this.maybeTokenMember = maybeTokenMember;
  }

  authorize() {
    if (!this.maybeTokenMember) throw E('Unauthorized', 401, null);
  }

  async member() {
    this.authorize();
    const member = await T.members.get(this.maybeTokenMember!.id);
    if (!member) throw E('Unauthorized', 401, null);
    return member;
  }

  async $membersWithSharedResources(): Promise<MemberWithTagOnly[]> {
    const members = await QQ<MemberWithTagOnly>`SELECT id, tag FROM members WHERE tag IS NOT NULL`;
    const sitesMembers = await QQ<{
      member_id: number;
    }>`SELECT DISTINCT member_id FROM files WHERE site_id IS NULL`;
    const membersWithSharedResources: MemberWithTagOnly[] = [];
    sitesMembers.forEach(({ member_id }) => {
      const member = members.find((m) => m.id === member_id);
      if (member?.tag) membersWithSharedResources.push(member);
    });
    return membersWithSharedResources;
  }

  async $sharedResourcesByMemberId(p: { memberId: number }): Promise<FileB64[]> {
    return (
      await QQ<File_>`SELECT * FROM files WHERE member_id = ${p.memberId} AND is_dist = FALSE AND site_id IS NULL`
    ).map(updateFileToB64);
  }

  async $memberSites(p: { memberId: number }): Promise<Site[]> {
    return await T.sites.where({ member_id: p.memberId }).all();
  }

  async $siteFiles(p: { siteId: string }): Promise<FileB64[]> {
    return (await T.files.where({ site_id: p.siteId, is_dist: false }).all()).map(updateFileToB64);
  }

  // ████████╗███████╗██╗████████╗███████╗███████╗
  // ╚══██╔══╝██╔════╝██║╚══██╔══╝██╔════╝██╔════╝
  //    ██║   ███████╗██║   ██║   █████╗  ███████╗
  //    ██║   ╚════██║██║   ██║   ██╔══╝  ╚════██║
  //    ██║   ███████║██║   ██║   ███████╗███████║
  //    ╚═╝   ╚══════╝╚═╝   ╚═╝   ╚══════╝╚══════╝

  tsitePublicProps = ['id', 'config', 'name', 'subdomain', 'domain'];
  tsiteSanitizedProps(props: string[]) {
    return props.filter((c) => this.tsitePublicProps.indexOf(c) !== -1);
  }

  async getSite(siteId: string, props: string[]): Promise<Partial<TSite> | null> {
    if (!props.length) throw E('No valid properties selected', 400, null);
    const tsite = (
      await QQ<Partial<TSite>>`SELECT ${sql.raw(props.join(', '))} FROM tsites WHERE id = ${siteId}`
    )[0];
    return tsite || null;
  }

  async $tsites(p: { props: string[]; token: string }): Promise<Partial<TSite>[]> {
    await this.adminMemberAuthorized(p.token);
    const selectProps = this.tsiteSanitizedProps(p.props);
    if (!selectProps.length) throw E('No valid properties selected', 400, null);
    const tsites = await QQ<Partial<TSite>>`SELECT ${sql.raw(selectProps.join(', '))} FROM tsites`;
    return tsites;
  }

  async $tsite(p: { siteId: string; props: string[] }): Promise<Partial<TSite> | null> {
    const selectProps = this.tsiteSanitizedProps(p.props);
    if (selectProps.length === 0) {
      throw E('No valid properties selected', 400, null);
    }
    return await this.getSite(p.siteId, selectProps);
  }

  async $tsiteSetConfig(p: {
    siteId: string;
    config: Config;
  }): Promise<{ errors: ValidationError[] }> {
    const tsite = (await QQ<TSite>`SELECT id FROM tsites WHERE id = ${p.siteId}`)[0];
    if (!tsite) return { errors: [valErr('Site not found')] };
    const errors = validateConfig(p.config);
    if (errors.length > 0) return { errors };
    else {
      await T.tsites.update(p.siteId, { config: p.config });
      return { errors: [] };
    }
  }

  async $checkSubdomainAvailability(p: { subdomain: string; siteId: string }): Promise<boolean> {
    const tsite = (
      await QQ`SELECT id FROM tsites WHERE subdomain = ${p.subdomain} AND id != ${p.siteId}`
    )[0];
    if (tsite) return false;
    return true;
  }

  async $tokenFromAccessKey(p: { siteId: string; plainAccessKey: string }): Promise<string | null> {
    const tsite = await this.getSite(p.siteId, ['access_key']);
    if (!tsite) {
      return null;
    }

    const isValid = await hashCompare(p.plainAccessKey, tsite.access_key!);

    return isValid ? Token.generate({ siteId: p.siteId, type: 'access-key' }) : null;
  }

  // ███╗   ███╗███████╗███╗   ███╗██████╗ ███████╗██████╗ ███████╗
  // ████╗ ████║██╔════╝████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔════╝
  // ██╔████╔██║█████╗  ██╔████╔██║██████╔╝█████╗  ██████╔╝███████╗
  // ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██╔══██╗██╔══╝  ██╔══██╗╚════██║
  // ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║██████╔╝███████╗██║  ██║███████║
  // ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝

  async adminMemberAuthorized(token: string) {
    const tokenData = Token.verifyAndGetPayload(token);
    if (!tokenData) throw E('Unauthorized', 401, null);
    if (tokenData.type !== 'member') throw E('Unauthorized', 401, null);

    const adminMember = (
      await QQ<Member>`SELECT * FROM members WHERE id = ${tokenData.memberId} AND is_admin = TRUE`
    )[0];
    if (!adminMember) throw E('Unauthorized', 401, null);
    return adminMember;
  }

  async $tokenFromMemberCredentials(p: { email: string; password: string }) {
    const member = await T.members.where({ email: p.email }).one();
    if (!member) return null;
    const isValid = await hashCompare(p.password, member.passphrase);
    if (!isValid) return null;
    return Token.generate({ memberId: member.id, type: 'member' });
  }
}

type MemberWithTagOnly = { id: number; tag: string };

// const P = Functions.prototype;

// P.$withSharedResources = async (): Promise<withSharedResourcesResponse> => {
//   this.authorize();
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
// };

// function authRequest(req: Request) {
//   let maybeTokenMember = verifiedTokenFromHeader(req.headers);
//   if (maybeTokenMember && !validateTokenExpiry(maybeTokenMember)) maybeTokenMember = null;
//   if (!maybeTokenMember) throw E('Unauthorized', 401, null);
//   return maybeTokenMember;
// }

// export async function withSharedResources(req: Request): Promise<withSharedResourcesResponse> {

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
