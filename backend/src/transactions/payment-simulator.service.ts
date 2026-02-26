import { Injectable } from '@nestjs/common';
import { FailureReason } from './enums/failure-reason.enum';
import { TransactionStatus } from './enums/transaction-status.enum';

export interface PaymentDetails {
  cardHolderName: string;
  cardLastFour: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface SimulationResult {
  status: TransactionStatus;
  failureReason: FailureReason | null;
}

@Injectable()
export class PaymentSimulatorService {
  simulate(details: PaymentDetails): SimulationResult {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed

    // Priority 1: expired card
    if (
      details.expiryYear < currentYear ||
      (details.expiryYear === currentYear &&
        details.expiryMonth < currentMonth)
    ) {
      return {
        status: TransactionStatus.DECLINED,
        failureReason: FailureReason.CARD_EXPIRED,
      };
    }

    // Priority 2: hard decline (magic test number)
    if (details.cardLastFour === '0000') {
      return {
        status: TransactionStatus.DECLINED,
        failureReason: FailureReason.DO_NOT_HONOR,
      };
    }

    // Priority 3: insufficient funds (magic test number)
    if (details.cardLastFour === '0002') {
      return {
        status: TransactionStatus.DECLINED,
        failureReason: FailureReason.INSUFFICIENT_FUNDS,
      };
    }

    return { status: TransactionStatus.APPROVED, failureReason: null };
  }
}
