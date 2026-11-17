import { apiRequest, apiBlobRequest } from './client';
import type {
  Quotation,
  QuotationCustomer,
  QuotationFormData,
  QuotationProduct,
  QuotationStatus,
} from '../types/quotationTypes';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getQuotations = async (): Promise<Quotation[]> => {
  const response = await apiRequest<ApiResponse<Quotation[]>>(
    '/quotations',
  );
  return response.data;
};

export const getQuotationById = async (
  id: number,
): Promise<Quotation> => {
  const response = await apiRequest<ApiResponse<Quotation>>(
    `/quotations/${id}`,
  );
  return response.data;
};

export const addQuotation = async (
  data: QuotationFormData,
) => {
  return apiRequest<ApiResponse<unknown>>('/quotations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateQuotation = (id: number, data: QuotationFormData) =>
  apiRequest<ApiResponse<Quotation>>(`/quotations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const searchQuotationCustomers = async (
  search: string,
): Promise<QuotationCustomer[]> => {
  const response = await apiRequest<ApiResponse<QuotationCustomer[]>>(
    `/quotations/customers/search?search=${encodeURIComponent(search)}`,
  );
  return response.data;
};

export const searchQuotationProducts = async (
  search: string,
): Promise<QuotationProduct[]> => {
  const response = await apiRequest<ApiResponse<QuotationProduct[]>>(
    `/quotations/products/search?search=${encodeURIComponent(search)}`,
  );
  return response.data;
};

export const updateQuotationStatus = async (
  id: number,
  status: QuotationStatus,
) => {
  return apiRequest(`/quotations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const deleteQuotation = async (id: number) => {
  return apiRequest(`/quotations/${id}`, {
    method: 'DELETE',
  });
};

export const previewQuotationPDF = async (id: number): Promise<Blob> => {
  return apiBlobRequest(`/quotations/${id}/pdf`);
};

export const downloadQuotationPDF = async (id: number): Promise<Blob> => {
  return apiBlobRequest(`/quotations/${id}/pdf?download=true`);
};


// export const downloadQuotationPDF = async (
//   id: number,
// ): Promise<Blob> => {
//   const response = await fetch(
//     `/api/quotations/${id}/pdf`,
//     {
//       method: 'GET',
//       credentials: 'include',
//     },
//   );

//   if (!response.ok) {
//     throw new Error('Unable to download quotation PDF');
//   }

//   return response.blob();
// };


// export const previewQuotationPDF = async (id: number): Promise<Blob> => {
//   const response = await fetch(
//     `http://localhost:5000/api/quotations/${id}/pdf`,
//     {
//       method: 'GET',
//       credentials: 'include',
//     },
//   );

//   if (!response.ok) {
//     throw new Error('Unable to generate quotation PDF');
//   }

//   const blob = await response.blob();

//   if (blob.type !== 'application/pdf') {
//     throw new Error('The server did not return a valid PDF');
//   }

//   return blob;
// };