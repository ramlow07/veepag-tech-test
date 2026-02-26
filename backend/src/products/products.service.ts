import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from './enums/product-status.enum';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  create(dto: CreateProductDto) {
    return this.productsRepository.create(dto);
  }

  async findById(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  findAll(filters: { status?: ProductStatus; page?: number; limit?: number }) {
    return this.productsRepository.findAll(filters);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productsRepository.update(id, dto);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }
}
