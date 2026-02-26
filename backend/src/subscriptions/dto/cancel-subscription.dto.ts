import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelSubscriptionDto {
  @IsString()
  @IsOptional()
  @MaxLength(300)
  cancellationReason?: string;
}