import { apiRequest } from './client'

export interface LoginForm {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: {
    id: number
    name: string
    email: string
  }
}

export function loginUser(
  form: LoginForm,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(form),
  })
}

export function getCurrentUser() {
  return apiRequest<{
    user: {
      id: number
      name: string
      email: string
    }
  }>('/auth/me')
}