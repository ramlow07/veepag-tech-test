export enum TransactionStatus {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
}

export enum FailureReason {
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  CARD_EXPIRED = 'card_expired',
  DO_NOT_HONOR = 'do_not_honor',
}

export interface PaymentDetails {
  cardHolderName: string;
  cardLastFour: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface Transaction {
  _id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  failureReason: FailureReason | null;
  paymentDetails: PaymentDetails;
  processedAt: string;
  createdAt: string;
}
