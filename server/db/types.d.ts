export type Member = {
  id: number;
  email: string;
  full_name: string;
  is_admin: string;
  active: boolean;
  passphrase: string;
  created_at: string;
};

export type Site = {
  id: number;
  name: string;
  local_name: string;
  domain_name: string;
  member_id: number;
  created_at: string;
};

export type File_ = {
  id: string;
  site_id: number;
  name: string;
  data: Buffer;
  data_type: string;
  data_size: string;
  data_cdn_url: string;
  created_at: string;
};

export type SanitizedMember = Omit<Member, 'passphrase'>;
