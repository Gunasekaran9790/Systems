import { z } from 'zod';

const itemSchema = z.object({
  product_id: z.number().int().positive().nullable(),
  description: z.string().trim().min(1, 'Item description is required')
    .max(255, 'Description cannot exceed 255 characters'),
  quantity: z.number().positive('Quantity must be greater than zero')
    .max(999999999, 'Quantity is too large'),
  unit: z.string().trim().min(1, 'Unit is required').max(30),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  discount_amount: z.number().min(0, 'Discount cannot be negative'),
});

export const createQuotationSchema = z.object({
  customer_id: z.number().int().positive('Please select a customer'),
  quotation_date: z.string().date('Enter a valid quotation date'),
  valid_until: z.string().date('Enter a valid expiry date')
    .nullable()
    .optional(),
  notes: z.string().max(5000).optional().default(''),
  cgst_rate: z.number().min(0).max(100).default(0),
  sgst_rate: z.number().min(0).max(100).default(0),
  igst_rate: z.number().min(0).max(100).default(0),
  items: z.array(itemSchema).min(1, 'Add at least one quotation item'),
}).superRefine((data, ctx) => {
  if (data.valid_until && data.valid_until < data.quotation_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['valid_until'],
      message: 'Valid until date cannot be before quotation date',
    });
  }

  data.items.forEach((item, index) => {
    if (item.discount_amount > item.quantity * item.unit_price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items', index, 'discount_amount'],
        message: 'Item discount cannot exceed its gross amount',
      });
    }
  });
});

export const updateQuotationStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED',
    'CANCELLED',
  ]),
});

export const quotationIdParamsSchema = z.object({
  id: z.coerce.number().int().positive('Invalid quotation ID'),
});