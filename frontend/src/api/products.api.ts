import type { BillingCycle, Product, ProductStatus } from "../types/product.types";
import client from "./client";

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  status?: ProductStatus;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await client.get<Product>(`/products/${id}`);
  return data;
}

export async function getProducts(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Product[]; total: number }> {
  const { data } = await client.get<{ data: Product[]; total: number }>(
    "/products",
    { params },
  );
  return data;
}

export async function createProduct(dto: CreateProductDto): Promise<Product> {
  const { data } = await client.post<Product>("/products", dto);
  return data;
}

export async function updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
  const { data } = await client.patch<Product>(`/products/${id}`, dto);
  return data;
}
