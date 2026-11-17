export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface QuotationItem {
  id?: number;
  product_id: number | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_amount: number;
  line_total?: number;
}

export interface Quotation {
  id: number;
  quotation_no: string;
  customer_id: number;
  customer_name: string;
  customer_code: string;
  customer_state: string | null;
  customer_state_code: string | null;
  quotation_date: string;
  valid_until: string | null;
  revision_no: number;
  subtotal: number | string;
  discount_amount: number | string;
  cgst_rate: number | string;
  sgst_rate: number | string;
  igst_rate: number | string;
  cgst_amount: number | string;
  sgst_amount: number | string;
  igst_amount: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  status: QuotationStatus;
  notes: string | null;
  revision_reason: string | null;
  items: QuotationItem[];
  created_at: string;
  updated_at: string;
}

export interface QuotationFormData {
  customer_id: number;
  quotation_date: string;
  valid_until: string | null;
  notes: string;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  items: QuotationItem[];
}

export interface QuotationCustomer {
  id: number;
  customer_code: string;
  name: string;
  company_name: string | null;
  state: string | null;
  state_code: string | null;
}

export interface QuotationProduct {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  selling_price: number | string;
}