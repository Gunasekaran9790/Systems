import { z } from 'zod';

// Product SKU
const skuSchema = z.string()
  .trim()
  .min(1, 'SKU is required')
  .max(15, 'SKU cannot exceed 15 characters');

// Product name
const nameSchema = z.string()
  .trim()
  .min(1, 'Product name is required')
  .max(200, 'Product name cannot exceed 200 characters');

// Unit
const unitSchema = z.string()
  .trim()
  .min(1, 'Unit is required')
  .max(10, 'Unit cannot exceed 10 characters');

// Description
const descriptionSchema = z.string()
  .trim()
  .max(65535, 'Description is too long')
  .nullable()
  .optional();

// Decimal number validation
function decimalSchema(
  max: number,
  decimalPlaces: number,
  label: string,
) {
  return z.preprocess(
    (value) => {
      if (typeof value === 'string' && value.trim() === '') {
        return NaN;
      }

      return typeof value === 'string' || typeof value === 'number'
        ? Number(value)
        : value;
    },
    z.number()
      .finite(`${label} must be a valid number`)
      .min(0, `${label} cannot be negative`)
      .max(max, `${label} exceeds the maximum allowed value`)
      .refine(
        (value) =>
          Number.isInteger(value * Math.pow(10, decimalPlaces)),
        `${label} cannot have more than ${decimalPlaces} decimal places`,
      ),
  );
}

// Product schema
export const productSchema = z.object({
  sku: skuSchema,

  name: nameSchema,

  description: descriptionSchema,

  unit: unitSchema,

  purchase_price: decimalSchema(
    9999999999999.99,
    2,
    'Purchase price',
  ),

  selling_price: decimalSchema(
    9999999999999.99,
    2,
    'Selling price',
  ),

  tax_rate: decimalSchema(
    999.99,
    2,
    'Tax rate',
  ),

  stock_quantity: decimalSchema(
    999999999999.999,
    3,
    'Stock quantity',
  ),

  minimum_stock: decimalSchema(
    999999999999.999,
    3,
    'Minimum stock',
  ),

  status: z.enum(['ACTIVE', 'INACTIVE']),
});

// Product ID validation
export const productIdSchema = z.object({
  id: z.string().regex(
    /^[1-9]\d*$/,
    'Invalid product ID',
  ),
});

// Product status validation
export const productStatusSchema = z.object({
  status: z.enum(
    ['ACTIVE', 'INACTIVE'],
    {
      message: 'Invalid product status.',
    },
  ),
});

// TypeScript type
export type ProductInput = z.infer<typeof productSchema>;