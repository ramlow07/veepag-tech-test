import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FailureReason } from './enums/failure-reason.enum';
import { TransactionStatus } from './enums/transaction-status.enum';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

export interface CreateTransactionData {
  subscriptionId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  failureReason: FailureReason | null;
  paymentDetails: {
    cardHolderName: string;
    cardLastFour: string;
    cardBrand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  processedAt: Date;
}

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(data: CreateTransactionData): Promise<TransactionDocument> {
    const transaction = new this.transactionModel(data);
    return transaction.save();
  }

  async findBySubscriptionId(
    subscriptionId: string,
  ): Promise<TransactionDocument[]> {
    return this.transactionModel
      .find({ subscriptionId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
