export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMIANNUAL',
  ANNUAL = 'ANNUAL',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}
