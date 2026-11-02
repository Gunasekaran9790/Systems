export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  purchase_price: number | string;
  selling_price: number | string;
  tax_rate: number | string;
  stock_quantity: number | string;
  minimum_stock: number | string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface ProductForm {
  sku: string;
  name: string;
  description?: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  tax_rate: number;
  stock_quantity: number;
  minimum_stock: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ProductsResponse {
  products: Product[];
}

export interface ProductResponse {
  message: string;
}

export interface SingleProductResponse {
  product: Product;
}