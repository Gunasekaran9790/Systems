import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(254),

  password: z
    .string()
    .min(1, 'Password is required')
    .max(128),
})