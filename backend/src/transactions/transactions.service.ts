import { Injectable } from '@nestjs/common';
import {
  PaymentDetails,
  PaymentSimulatorService,
} from './payment-simulator.service';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly paymentSimulator: PaymentSimulatorService,
  ) {}

  async createForSubscription(params: {
    subscriptionId: string;
    amount: number;
    currency: string;
    paymentDetails: PaymentDetails;
  }) {
    const { status, failureReason } = this.paymentSimulator.simulate(
      params.paymentDetails,
    );

    return this.transactionsRepository.create({
      subscriptionId: params.subscriptionId,
      amount: params.amount,
      currency: params.currency,
      status,
      failureReason,
      paymentDetails: params.paymentDetails,
      processedAt: new Date(),
    });
  }

  findBySubscriptionId(subscriptionId: string) {
    return this.transactionsRepository.findBySubscriptionId(subscriptionId);
  }
}
