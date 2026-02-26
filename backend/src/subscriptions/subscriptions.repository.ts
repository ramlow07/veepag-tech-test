import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import {
  Subscription,
  SubscriptionDocument,
} from './schemas/subscription.schema';

@Injectable()
export class SubscriptionsRepository {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async create(data: Record<string, any>): Promise<SubscriptionDocument> {
    const subscription = new this.subscriptionModel(data);
    return subscription.save();
  }

  async findById(id: string): Promise<SubscriptionDocument | null> {
    return this.subscriptionModel.findById(id).exec();
  }

  async findByCpf(cpf: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel
      .find({ customerCpf: cpf })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(filters: {
    status?: SubscriptionStatus;
    productId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: SubscriptionDocument[]; total: number }> {
    const { status, productId, page = 1, limit = 20 } = filters;
    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (productId) query.productId = new Types.ObjectId(productId);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.subscriptionModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.subscriptionModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async update(
    id: string,
    data: Record<string, any>,
  ): Promise<SubscriptionDocument | null> {
    return this.subscriptionModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async findActiveByProductAndCpf(
    productId: string,
    cpf: string,
  ): Promise<SubscriptionDocument | null> {
    return this.subscriptionModel
      .findOne({
        productId: new Types.ObjectId(productId),
        customerCpf: cpf,
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();
  }
}
