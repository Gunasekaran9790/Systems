export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  company_name: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
  tax_number: string | null;
  tax_number_type: string | null;
  credit_limit: number | string;
  opening_balance: number | string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface CustomerForm {
  customer_code: string;
  name: string;
  company_name?: string;
  phone_1?: string;
  phone_2?: string;
  email?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  tax_number?: string;
  tax_number_type?: string;
  credit_limit: number;
  opening_balance: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CustomersResponse {
  customers: Customer[];
}

export interface CustomerResponse {
  message: string;
}

export interface SingleCustomerResponse {
  customer: Customer;
}