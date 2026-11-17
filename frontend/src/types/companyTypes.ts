export interface Company {
  id: number;
  company_name: string;
  trade_name: string | null;
  gstin: string | null;
  pan: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  state_code: string | null;
  pincode: string | null;
  country: string;
  logo_path: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  authorised_signatory: string | null;
  invoice_footer: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyResponse {
  company: Company | null;
}

export interface CompanySaveResponse {
  success: boolean;
  message: string;
  company: Company;
}

export interface CompanyFormData {
  company_name: string;
  trade_name: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  state_code: string;
  pincode: string;
  country: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  authorised_signatory: string;
  invoice_footer: string;
}