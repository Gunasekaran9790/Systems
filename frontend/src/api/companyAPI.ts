import { apiRequest } from './client';
import type {
  CompanyResponse,
  CompanySaveResponse,
} from '../types/companyTypes';

export const companyAPI = {
  getCompany: () =>
    apiRequest<CompanyResponse>('/company'),

  saveCompany: (formData: FormData) =>
    apiRequest<CompanySaveResponse>('/company', {
      method: 'PUT',
      body: formData,
    }),
};