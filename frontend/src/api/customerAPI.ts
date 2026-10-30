
import { apiRequest } from './client'
import type {
  Customer,
  CustomerForm,
  CustomersResponse,
  CustomerResponse,
  SingleCustomerResponse,
} from '../types/customerTypes';

export function getCustomers(): Promise<CustomersResponse> {
  return apiRequest<CustomersResponse>('/customers');
}

export function getCustomerById(
  id: number | string,
): Promise<SingleCustomerResponse> {
  return apiRequest<SingleCustomerResponse>(`/customers/${id}`);
}

export function addCustomer(
  form: CustomerForm,
): Promise<CustomerResponse> {
  return apiRequest<CustomerResponse>('/customers', {
    method: 'POST',
    body: JSON.stringify(form),
  });
}

export function updateCustomer(
  id: number | string,
  form: CustomerForm,
): Promise<CustomerResponse> {
  return apiRequest<CustomerResponse>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(form),
  });
}

export function updateCustomerStatus(
  id: number | string,
  status: 'ACTIVE' | 'INACTIVE',
): Promise<CustomerResponse> {
  return apiRequest<CustomerResponse>(`/customers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteCustomer(
  id: number | string,
): Promise<CustomerResponse> {
  return apiRequest<CustomerResponse>(`/customers/${id}`, {
    method: 'DELETE',
  });
}