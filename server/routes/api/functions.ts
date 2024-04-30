import { T, QQ, Q, sql, File_, Site, FileB64 } from '@db';
import {
  TokenMember,
  sanitizeMember,
  updateFileToB64,
  validateTokenExpiry,
  verifiedTokenFromHeader,
} from '@server/lib/utils';
import { Request } from 'express';

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
