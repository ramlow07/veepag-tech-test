import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FailureReason } from '../enums/failure-reason.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

export type TransactionDocument = HydratedDocument<Transaction>;

// Only last 4 digits + brand are stored following PCI-DCSS patterns.
class PaymentDetails {
  @Prop({ required: true })
  cardHolderName: string;

  @Prop({ required: true, length: 4 })
  cardLastFour: string;

  @Prop({ required: true })
  cardBrand: string;

  @Prop({ required: true })
  expiryMonth: number;

  @Prop({ required: true })
  expiryYear: number;
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Subscription' })
  subscriptionId: Types.ObjectId;

  @Prop({ required: true, type: Number, min: 1 })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, enum: TransactionStatus })
  status: TransactionStatus;

  @Prop({ enum: FailureReason, default: null })
  failureReason: FailureReason;

  @Prop({ required: true, type: PaymentDetails })
  paymentDetails: PaymentDetails;

  @Prop({ required: true })
  processedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Index for primary query: list all transactions for a given subscription
TransactionSchema.index({ subscriptionId: 1 });