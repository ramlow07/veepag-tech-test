import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { isValidCpf, stripCpf } from '../common/utils/cpf.utils';
import { ProductStatus } from '../products/enums/product-status.enum';
import { ProductsService } from '../products/products.service';
import { TransactionStatus } from '../transactions/enums/transaction-status.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { SubscriptionsRepository } from './subscriptions.repository';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly productsService: ProductsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    // 1. Validate product exists (throws 404 if not found)
    const product = await this.productsService.findById(dto.productId);

    // 2. Product must be active
    if (product.status !== ProductStatus.ACTIVE) {
      throw new UnprocessableEntityException(
        'Product is not available for subscription',
      );
    }

    // 3. Validate CPF
    const cpf = stripCpf(dto.customerCpf);
    if (!isValidCpf(cpf)) {
      throw new BadRequestException('Invalid CPF');
    }

    // 4. Prevent duplicate active subscription for same customer + product
    const duplicate = await this.subscriptionsRepository.findActiveByProductAndCpf(
      dto.productId,
      cpf,
    );
    if (duplicate) {
      throw new ConflictException(
        'Customer already has an active subscription for this product',
      );
    }

    // 5. Create subscription in PENDING state
    const subscription = await this.subscriptionsRepository.create({
      productId: new Types.ObjectId(dto.productId),
      productSnapshot: {
        name: product.name,
        price: product.price,
        currency: product.currency,
        billingCycle: product.billingCycle,
      },
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerCpf: cpf,
      status: SubscriptionStatus.PENDING,
    });

    // 6. Simulate payment and record transaction
    // If payment infrastructure fails, mark subscription as PAYMENT_FAILED
    let transaction;
    try {
      transaction = await this.transactionsService.createForSubscription({
        subscriptionId: subscription._id.toString(),
        amount: product.price,
        currency: product.currency,
        paymentDetails: dto.paymentDetails,
      });
    } catch (error) {
      await this.subscriptionsRepository.update(subscription._id.toString(), {
        status: SubscriptionStatus.PAYMENT_FAILED,
      });
      throw error;
    }

    // 7. Update subscription status based on payment result
    const newStatus =
      transaction.status === TransactionStatus.APPROVED
        ? SubscriptionStatus.ACTIVE
        : SubscriptionStatus.PAYMENT_FAILED;

    const updatedSubscription = await this.subscriptionsRepository.update(
      subscription._id.toString(),
      { status: newStatus },
    );

    return { subscription: updatedSubscription, transaction };
  }

  async findByCpf(rawCpf: string) {
    const cpf = stripCpf(rawCpf);
    if (cpf.length !== 11) {
      throw new BadRequestException('Invalid CPF format');
    }
    return this.subscriptionsRepository.findByCpf(cpf);
  }

  findAll(filters: {
    status?: SubscriptionStatus;
    productId?: string;
    page?: number;
    limit?: number;
  }) {
    return this.subscriptionsRepository.findAll(filters);
  }

  async cancel(id: string, dto: CancelSubscriptionDto) {
    const subscription = await this.subscriptionsRepository.findById(id);
    if (!subscription) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }

    const nonCancellableStatuses = [
      SubscriptionStatus.CANCELLED,
      SubscriptionStatus.PAYMENT_FAILED,
    ];
    if (nonCancellableStatuses.includes(subscription.status)) {
      throw new ConflictException(
        `Cannot cancel a subscription with status ${subscription.status}`,
      );
    }

    return this.subscriptionsRepository.update(id, {
      status: SubscriptionStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: dto.cancellationReason ?? null,
    });
  }
}
