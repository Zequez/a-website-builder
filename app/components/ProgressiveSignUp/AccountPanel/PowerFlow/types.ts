export type Recipient = {
  name: string;
  proposals: Record<string, any>[];
};

export type PledgeCurrency = 'ars' | 'usd';
export type PledgeMode = 'onetime' | 'monthly' | 'yearly';
export type PledgeStatus = 'draft' | 'committed' | 'done' | 'active';

export const CURRENCY_LIST: PledgeCurrency[] = ['ars', 'usd'];
export const MODES_LIST: PledgeMode[] = ['onetime', 'monthly', 'yearly'];
export const STATUS_LIST: PledgeStatus[] = ['draft', 'committed', 'done', 'active'];

export type Pledge = {
  amount: number;
  currency: PledgeCurrency;
  completedAt: null | Date;
  mode: PledgeMode;
  status: PledgeStatus;
  nextRenew: null | Date;
  towards: {
    [key: string]: number;
  };
  historic: [string, number][];
};
