import { BillingCycle } from './product.types';

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CANCELLED = 'CANCELLED',
}

export interface ProductSnapshot {
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
}

export interface Subscription {
  _id: string;
  productId: string;
  productSnapshot: ProductSnapshot;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  status: SubscriptionStatus;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetailsInput {
  cardHolderName: string;
  cardLastFour: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface CreateSubscriptionInput {
  productId: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  paymentDetails: PaymentDetailsInput;
}
