import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from './enums/product-status.enum';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(dto);
    return product.save();
  }

  async findById(id: string): Promise<ProductDocument | null> {
    return this.productModel.findById(id).exec();
  }

  async findAll(filters: {
    status?: ProductStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: ProductDocument[]; total: number }> {
    const { status, page = 1, limit = 20 } = filters;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }
}
