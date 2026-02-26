import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BillingCycle } from '../products/enums/billing-cycle.enum';
import { ProductStatus } from '../products/enums/product-status.enum';
import { ProductsService } from '../products/products.service';
import { FailureReason } from '../transactions/enums/failure-reason.enum';
import { TransactionStatus } from '../transactions/enums/transaction-status.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SubscriptionsService } from './subscriptions.service';

// Valid Brazilian CPF (verified by checksum)
const VALID_CPF = '52998224725';

// Must be a valid 24-char hex string for new Types.ObjectId() in the service
const VALID_PRODUCT_ID = '64a1b2c3d4e5f6a7b8c9d0e1';

const mockActiveProduct = {
  _id: VALID_PRODUCT_ID,
  name: 'Premium Plan',
  price: 9900,
  currency: 'BRL',
  billingCycle: BillingCycle.MONTHLY,
  status: ProductStatus.ACTIVE,
};

const mockInactiveProduct = {
  ...mockActiveProduct,
  status: ProductStatus.INACTIVE,
};

const mockPaymentDetails = {
  cardHolderName: 'John Doe',
  cardLastFour: '1234',
  cardBrand: 'visa',
  expiryMonth: 12,
  expiryYear: new Date().getFullYear() + 1,
};

const createDto = {
  productId: VALID_PRODUCT_ID,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerCpf: VALID_CPF,
  paymentDetails: mockPaymentDetails,
};

const mockPendingSubscription = {
  _id: { toString: () => 'sub-id' },
  productId: 'product-id',
  customerCpf: VALID_CPF,
  status: SubscriptionStatus.PENDING,
};

const mockApprovedTransaction = {
  _id: 'txn-id',
  status: TransactionStatus.APPROVED,
  failureReason: null,
};

const mockDeclinedTransaction = {
  _id: 'txn-id',
  status: TransactionStatus.DECLINED,
  failureReason: FailureReason.INSUFFICIENT_FUNDS,
};

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let subscriptionsRepository: jest.Mocked<SubscriptionsRepository>;
  let productsService: jest.Mocked<ProductsService>;
  let transactionsService: jest.Mocked<TransactionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: SubscriptionsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByCpf: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            findActiveByProductAndCpf: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: TransactionsService,
          useValue: {
            createForSubscription: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    subscriptionsRepository = module.get(SubscriptionsRepository);
    productsService = module.get(ProductsService);
    transactionsService = module.get(TransactionsService);
  });

  describe('create', () => {
    it('throws NotFoundException when product does not exist', async () => {
      productsService.findById.mockRejectedValue(new NotFoundException());

      await expect(service.create(createDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws UnprocessableEntityException when product is inactive', async () => {
      productsService.findById.mockResolvedValue(mockInactiveProduct as any);

      await expect(service.create(createDto as any)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('throws BadRequestException when CPF is invalid', async () => {
      productsService.findById.mockResolvedValue(mockActiveProduct as any);

      await expect(
        service.create({ ...createDto, customerCpf: '00000000000' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when customer already has an active subscription', async () => {
      productsService.findById.mockResolvedValue(mockActiveProduct as any);
      subscriptionsRepository.findActiveByProductAndCpf.mockResolvedValue(
        mockPendingSubscription as any,
      );

      await expect(service.create(createDto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates subscription with ACTIVE status when payment is approved', async () => {
      productsService.findById.mockResolvedValue(mockActiveProduct as any);
      subscriptionsRepository.findActiveByProductAndCpf.mockResolvedValue(null);
      subscriptionsRepository.create.mockResolvedValue(
        mockPendingSubscription as any,
      );
      transactionsService.createForSubscription.mockResolvedValue(
        mockApprovedTransaction as any,
      );
      const activeSubscription = {
        ...mockPendingSubscription,
        status: SubscriptionStatus.ACTIVE,
      };
      subscriptionsRepository.update.mockResolvedValue(activeSubscription as any);

      const result = await service.create(createDto as any);

      expect(result.subscription.status).toBe(SubscriptionStatus.ACTIVE);
      expect(result.transaction.status).toBe(TransactionStatus.APPROVED);
      expect(subscriptionsRepository.update).toHaveBeenCalledWith(
        'sub-id',
        expect.objectContaining({ status: SubscriptionStatus.ACTIVE }),
      );
    });

    it('creates subscription with PAYMENT_FAILED status when payment is declined', async () => {
      productsService.findById.mockResolvedValue(mockActiveProduct as any);
      subscriptionsRepository.findActiveByProductAndCpf.mockResolvedValue(null);
      subscriptionsRepository.create.mockResolvedValue(
        mockPendingSubscription as any,
      );
      transactionsService.createForSubscription.mockResolvedValue(
        mockDeclinedTransaction as any,
      );
      const failedSubscription = {
        ...mockPendingSubscription,
        status: SubscriptionStatus.PAYMENT_FAILED,
      };
      subscriptionsRepository.update.mockResolvedValue(failedSubscription as any);

      const result = await service.create(createDto as any);

      expect(result.subscription.status).toBe(SubscriptionStatus.PAYMENT_FAILED);
      expect(result.transaction.status).toBe(TransactionStatus.DECLINED);
      expect(subscriptionsRepository.update).toHaveBeenCalledWith(
        'sub-id',
        expect.objectContaining({ status: SubscriptionStatus.PAYMENT_FAILED }),
      );
    });
  });

  describe('cancel', () => {
    it('cancels an active subscription', async () => {
      const activeSubscription = {
        _id: 'sub-id',
        status: SubscriptionStatus.ACTIVE,
      };
      const cancelledSubscription = {
        ...activeSubscription,
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: expect.any(Date),
      };
      subscriptionsRepository.findById.mockResolvedValue(
        activeSubscription as any,
      );
      subscriptionsRepository.update.mockResolvedValue(
        cancelledSubscription as any,
      );

      const result = await service.cancel('sub-id', {});

      expect(result.status).toBe(SubscriptionStatus.CANCELLED);
      expect(subscriptionsRepository.update).toHaveBeenCalledWith(
        'sub-id',
        expect.objectContaining({ status: SubscriptionStatus.CANCELLED }),
      );
    });

    it('throws NotFoundException when subscription does not exist', async () => {
      subscriptionsRepository.findById.mockResolvedValue(null);

      await expect(service.cancel('nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when subscription is already cancelled', async () => {
      subscriptionsRepository.findById.mockResolvedValue({
        _id: 'sub-id',
        status: SubscriptionStatus.CANCELLED,
      } as any);

      await expect(service.cancel('sub-id', {})).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws ConflictException when subscription has PAYMENT_FAILED status', async () => {
      subscriptionsRepository.findById.mockResolvedValue({
        _id: 'sub-id',
        status: SubscriptionStatus.PAYMENT_FAILED,
      } as any);

      await expect(service.cancel('sub-id', {})).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
