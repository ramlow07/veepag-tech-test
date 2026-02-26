import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BillingCycle } from '../../products/enums/billing-cycle.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export type SubscriptionDocument = HydratedDocument<Subscription>;

// Snapshot of product data captured at subscription time.
// Ensures billing always reflects what the customer agreed to,
// even if the product price or status changes later.
class ProductSnapshot {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, enum: BillingCycle })
  billingCycle: BillingCycle;
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop({ required: true, type: ProductSnapshot })
  productSnapshot: ProductSnapshot;

  @Prop({ required: true, minlength: 2, maxlength: 120 })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  // Stored as 11-digit string (no formatting) for consistent lookup and indexing
  @Prop({ required: true, length: 11 })
  customerCpf: string;

  @Prop({ enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Prop({ default: null })
  cancelledAt: Date;

  @Prop({ maxlength: 300, default: null })
  cancellationReason: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Covers subscriptions-by-product queries
SubscriptionSchema.index({ productId: 1 });

// Covers status-filter queries
SubscriptionSchema.index({ status: 1 });

// Compound index: covers "My Subscriptions" CPF lookup AND duplicate-active check
// ({ customerCpf } queries use this via left-prefix rule — no separate index needed)
SubscriptionSchema.index({ customerCpf: 1, productId: 1, status: 1 });
