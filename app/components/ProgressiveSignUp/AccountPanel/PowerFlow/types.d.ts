export type Recipient = {
  name: string;
  proposals: Record<string, any>[];
};

export type Pledge = {
  amount: number;
  currency: string;
  completedAt: null | Date;
  mode: 'onetime' | 'recurring-month' | 'recurring-year';
  status: 'draft' | 'committed' | 'done' | 'active';
  nextRenew: null | Date;
  towards: {
    [key: string]: number;
  };
  historic: [string, number][];
};
