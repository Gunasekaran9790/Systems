import { apiRequest } from './client'
import type {
  SignupForm,
  SignupResponse,
} from '../types/authTypes'

export function signupUser(
  form: SignupForm,
): Promise<SignupResponse> {
  return apiRequest<SignupResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(form),
  })
}