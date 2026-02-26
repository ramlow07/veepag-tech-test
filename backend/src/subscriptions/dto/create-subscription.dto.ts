import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class PaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  cardHolderName: string;

  @IsString()
  @Length(4, 4)
  cardLastFour: string;

  @IsString()
  @IsNotEmpty()
  cardBrand: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  expiryMonth: number;

  @IsInt()
  @Min(2000)
  @Type(() => Number)
  expiryYear: number;
}

export class CreateSubscriptionDto {
  @IsMongoId()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  customerCpf: string;

  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails: PaymentDetailsDto;
}
