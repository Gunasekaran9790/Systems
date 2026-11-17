import type { QuotationFormData } from '../types/quotationTypes';

export type QuotationErrors = Record<string, string>;

export function validateQuotation(
  form: QuotationFormData,
  sameState: boolean,
): QuotationErrors {
  const errors: QuotationErrors = {};

  if (!form.customer_id) {
    errors.customer_id = 'Please select a customer';
  }

  if (!form.quotation_date) {
    errors.quotation_date = 'Quotation date is required';
  }

  if (
    form.valid_until &&
    form.quotation_date &&
    form.valid_until < form.quotation_date
  ) {
    errors.valid_until = 'Expiry date cannot be before quotation date';
  }

  if (!form.items.length) {
    errors.items = 'Add at least one item';
  }

  form.items.forEach((item, index) => {
    if (!item.description.trim()) {
      errors[`item_${index}_description`] = 'Description is required';
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      errors[`item_${index}_quantity`] = 'Quantity must be greater than zero';
    }

    if (!Number.isFinite(item.unit_price) || item.unit_price < 0) {
      errors[`item_${index}_price`] = 'Price cannot be negative';
    }

    if (
      !Number.isFinite(item.discount_amount) ||
      item.discount_amount < 0
    ) {
      errors[`item_${index}_discount`] = 'Discount cannot be negative';
    }

    const gross = item.quantity * item.unit_price;

    if (item.discount_amount > gross) {
      errors[`item_${index}_discount`] = 'Discount cannot exceed item amount';
    }
  });

  const rates = [
    form.cgst_rate,
    form.sgst_rate,
    form.igst_rate,
  ];

  if (rates.some((rate) => !Number.isFinite(rate) || rate < 0 || rate > 100)) {
    errors.gst = 'GST rates must be between 0 and 100';
  }

  if (sameState) {
    if (form.igst_rate !== 0) {
      errors.gst = 'IGST must be zero for same-state transactions';
    }
  } else if (form.cgst_rate !== 0 || form.sgst_rate !== 0) {
    errors.gst = 'CGST and SGST must be zero for different-state transactions';
  }

  return errors;
}