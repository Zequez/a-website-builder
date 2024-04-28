export type GoogleTokens = {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
  expiry_date: number;
};

export type Member = {
  id: number;
  email: string;
  full_name: string | null;
  is_admin: string;
  active: boolean;
  passphrase: string;
  created_at: string;
  subscribed_to_newsletter: boolean;
  telegram_handle: string | null;
  tag: string | null;
  google_tokens: GoogleTokens | null;
};

export type Site = {
  id: string;
  name: string;
  local_name: string;
  domain_name: string;
  member_id: number;
  created_at: string;
  updated_at: string;
};

export type File_ = {
  id: string;
  site_id: string;
  name: string;
  data: Buffer;
  data_type: string;
  data_size: string;
  data_cdn_url: string;
  created_at: string;
  updated_at: string;
};

export type Blob_ = {
  id: string;
  name: string;
  memberId: number;
  url: string;
  contentType: string;
  size: number;
  createdAt: string;
};

export type SanitizedMember = Omit<Member, 'passphrase' | 'google_tokens'> & { google: boolean };
