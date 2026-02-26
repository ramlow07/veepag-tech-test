import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BillingCycle } from '../enums/billing-cycle.enum';
import { ProductStatus } from '../enums/product-status.enum';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 120 })
  name: string;

  @Prop({ maxlength: 500 })
  description: string;

  // Price stored in cents (integer) to avoid floating-point issues
  @Prop({ required: true, type: Number, min: 1 })
  price: number;

  // Veepag proably uses just BRL. adding "currency" prop thinking about long-term and international scale.
  @Prop({ required: true, default: 'BRL', uppercase: true, maxlength: 3 })
  currency: string;

  @Prop({ required: true, enum: BillingCycle, type: String })
  billingCycle: BillingCycle;

  @Prop({ enum: ProductStatus, default: ProductStatus.ACTIVE, type: String })
  status: ProductStatus;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Compound index: serves filter-by-status queries AND filter+sort in a single scan
ProductSchema.index({ status: 1, createdAt: -1 });
