import { Product } from '../types/product.types';
import client from './client';

export async function getProduct(id: string): Promise<Product> {
  const { data } = await client.get<Product>(`/products/${id}`);
  return data;
}

export async function getProducts(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Product[]; total: number }> {
  const { data } = await client.get<{ data: Product[]; total: number }>('/products', { params });
  return data;
}
