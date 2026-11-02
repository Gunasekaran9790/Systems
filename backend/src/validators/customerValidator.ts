
import { z } from 'zod';

// Indian States and Union Territories
const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

// Optional string fields
const optionalString = (max: number) =>
  z.string()
    .trim()
    .max(max, `Maximum ${max} characters allowed`)
    .nullable()
    .optional();

// Indian mobile number
const phoneSchema = z.string().regex(
  /^[6-9]\d{9}$/,
  'Enter a valid 10-digit Indian mobile number'
);

// Customer schema
export const customerSchema = z.object({
  customer_code: z.string()
    .trim()
    .min(1, 'Customer code is required')
    .max(50, 'Customer code cannot exceed 50 characters'),

  name: z.string()
    .trim()
    .min(1, 'Customer name is required')
    .max(150, 'Customer name cannot exceed 150 characters'),

  company_name: optionalString(150),

  phone_1: phoneSchema,

  phone_2: z.union([
    phoneSchema,
    z.literal(''),
  ]).nullable().optional(),

  email: z.string()
    .trim()
    .max(150, 'Email cannot exceed 150 characters')
    .refine(
      (value) =>
        value === '' ||
        z.string().email().safeParse(value).success,
      'Please enter a valid email address'
    )
    .nullable()
    .optional(),

  address_line_1: optionalString(255),

  address_line_2: optionalString(255),

  city: optionalString(100),

  state: z.enum(indianStates, {
    message: 'Please select a valid Indian state or Union Territory',
  }),

  zipcode: z.string()
    .trim()
    .refine(
      (value) =>
        value === '' || /^[1-9]\d{5}$/.test(value),
      'Enter a valid 6-digit Indian PIN code'
    ),

  country: z.string()
    .trim()
    .min(1, 'Country is required')
    .max(100, 'Country cannot exceed 100 characters'),

  tax_number: optionalString(50),

  tax_number_type: optionalString(30),

  credit_limit: z.coerce.number()
    .finite('Enter a valid credit limit')
    .min(0, 'Credit limit cannot be negative'),

  opening_balance: z.coerce.number()
    .finite('Enter a valid opening balance')
    .min(0, 'Opening balance cannot be negative'),

  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const customerIdSchema = z.object({
  id: z.string().regex(
    /^[1-9]\d*$/,
    'Invalid customer ID'
  ),
});

// TypeScript type
export type CustomerInput = z.infer<typeof customerSchema>;
