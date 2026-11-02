import { apiRequest } from './client';

import type {
  ProductForm,
  ProductsResponse,
  ProductResponse,
  SingleProductResponse,
} from '../types/productTypes';

export function getProducts(): Promise<ProductsResponse> {
  return apiRequest<ProductsResponse>('/products');
}

export function getProductById(
  id: number | string,
): Promise<SingleProductResponse> {
  return apiRequest<SingleProductResponse>(`/products/${id}`);
}

export function addProduct(
  form: ProductForm,
): Promise<ProductResponse> {
  return apiRequest<ProductResponse>('/products', {
    method: 'POST',
    body: JSON.stringify(form),
  });
}

export function updateProduct(
  id: number | string,
  form: ProductForm,
): Promise<ProductResponse> {
  return apiRequest<ProductResponse>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(form),
  });
}

export function updateProductStatus(
  id: number | string,
  status: 'ACTIVE' | 'INACTIVE',
): Promise<ProductResponse> {
  return apiRequest<ProductResponse>(`/products/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteProduct(
  id: number | string,
): Promise<ProductResponse> {
  return apiRequest<ProductResponse>(`/products/${id}`, {
    method: 'DELETE',
  });
}