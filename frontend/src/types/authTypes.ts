export interface SignupForm {
  name: string
  email: string
  password: string
}

export interface SignupResponse {
  success: boolean
  message: string
  errors?: {
    field: string
    message: string
  }[]
}