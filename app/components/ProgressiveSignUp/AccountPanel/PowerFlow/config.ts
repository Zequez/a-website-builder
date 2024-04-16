import { PledgeCurrency, PledgeMode } from './types';

export const paymentLinks: {
  [key in PledgeCurrency]: { [key in PledgeMode]: { url: string; label: string } };
} = {
  ars: {
    monthly: {
      url: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c9380848e87412a018e8c0e2efb0206',
      label: 'MercadoPago',
    },
    yearly: {
      url: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c9380848ee1956c018ee584541b0405',
      label: 'MercadoPago',
    },
    onetime: {
      url: 'https://link.mercadopago.com.ar/hojaar',
      label: 'MercadoPago',
    },
  },
  usd: {
    monthly: { url: 'https://www.gumroad.com', label: 'Gumroad' },
    yearly: { url: 'https://www.gumroad.com', label: 'Gumroad' },
    onetime: { url: 'https://www.gumroad.com', label: 'Gumroad' },
  },
};

export const directPayments = {
  ars: {
    onetime:
      "You may also bank transfer me to the alias `zequez.uala` on Argentina, which is better it's fee-less",
  },
};
