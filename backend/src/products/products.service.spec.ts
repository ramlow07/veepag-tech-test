import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BillingCycle } from './enums/billing-cycle.enum';
import { ProductStatus } from './enums/product-status.enum';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

const mockProduct = {
  _id: 'product-id',
  name: 'Premium Plan',
  price: 9900,
  currency: 'BRL',
  billingCycle: BillingCycle.MONTHLY,
  status: ProductStatus.ACTIVE,
};

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(ProductsRepository);
  });

  describe('create', () => {
    it('creates and returns the product', async () => {
      repository.create.mockResolvedValue(mockProduct as any);
      const dto = { name: 'Premium Plan', price: 9900, billingCycle: BillingCycle.MONTHLY };

      const result = await service.create(dto as any);

      expect(result).toEqual(mockProduct);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findById', () => {
    it('returns the product when it exists', async () => {
      repository.findById.mockResolvedValue(mockProduct as any);

      const result = await service.findById('product-id');

      expect(result).toEqual(mockProduct);
    });

    it('throws NotFoundException when product does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('returns updated product when it exists', async () => {
      const updated = { ...mockProduct, name: 'Updated Plan' };
      repository.update.mockResolvedValue(updated as any);

      const result = await service.update('product-id', { name: 'Updated Plan' });

      expect(result.name).toBe('Updated Plan');
    });

    it('throws NotFoundException when product does not exist', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
