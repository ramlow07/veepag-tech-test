import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { BillingCycle } from '../enums/billing-cycle.enum';
import { ProductStatus } from '../enums/product-status.enum';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
