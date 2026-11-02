import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  addProduct,
  getProductById,
  updateProduct,
} from '../../api/productAPI';

import type {
  Product,
  ProductForm as ProductFormType,
} from '../../types/productTypes';

type FormValues = Omit<
  ProductFormType,
  | 'purchase_price'
  | 'selling_price'
  | 'tax_rate'
  | 'stock_quantity'
  | 'minimum_stock'
> & {
  purchase_price: string;
  selling_price: string;
  tax_rate: string;
  stock_quantity: string;
  minimum_stock: string;
};

const initialForm: FormValues = {
  sku: '',
  name: '',
  description: '',
  unit: 'PCS',
  purchase_price: '0',
  selling_price: '0',
  tax_rate: '0',
  stock_quantity: '0',
  minimum_stock: '0',
  status: 'ACTIVE',
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormValues>(initialForm);

  // Load existing product when editing
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getProductById(id)
      .then(({ product }: { product: Product }) => {
        if (cancelled) return;

        setForm({
          sku: product.sku,
          name: product.name,
          description: product.description ?? '',
          unit: product.unit,
          purchase_price: String(product.purchase_price ?? 0),
          selling_price: String(product.selling_price ?? 0),
          tax_rate: String(product.tax_rate ?? 0),
          stock_quantity: String(product.stock_quantity ?? 0),
          minimum_stock: String(product.minimum_stock ?? 0),
          status: product.status,
        });
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Handle input changes
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Validate numeric fields
  function validateNumbers(): boolean {
    const numericFields = [
      {
        label: 'Purchase Price',
        value: form.purchase_price,
      },
      {
        label: 'Selling Price',
        value: form.selling_price,
      },
      {
        label: 'Tax Rate',
        value: form.tax_rate,
      },
      {
        label: 'Stock Quantity',
        value: form.stock_quantity,
      },
      {
        label: 'Minimum Stock',
        value: form.minimum_stock,
      },
    ];

    for (const field of numericFields) {
      const value = Number(field.value);

      if (
        field.value.trim() === '' ||
        !Number.isFinite(value) ||
        value < 0
      ) {
        setError(
          `${field.label} must be a valid non-negative number.`,
        );

        return false;
      }
    }

    if (Number(form.tax_rate) > 999.99) {
      setError('Tax Rate cannot exceed 999.99%.');
      return false;
    }

    return true;
  }

  // Handle form submission
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();
    setError('');

    if (!form.sku.trim() || !form.name.trim() || !form.unit.trim()) {
      setError('SKU, Product Name and Unit are required.');
      return;
    }

    if (form.sku.trim().length > 15) {
      setError('SKU cannot exceed 15 characters.');
      return;
    }

    if (form.name.trim().length > 200) {
      setError('Product Name cannot exceed 200 characters.');
      return;
    }

    if (form.unit.trim().length > 10) {
      setError('Unit cannot exceed 10 characters.');
      return;
    }

    if (!validateNumbers()) return;

    const payload: ProductFormType = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      unit: form.unit.trim().toUpperCase(),
      purchase_price: Number(form.purchase_price),
      selling_price: Number(form.selling_price),
      tax_rate: Number(form.tax_rate),
      stock_quantity: Number(form.stock_quantity),
      minimum_stock: Number(form.minimum_stock),
      status: form.status,
    };

    setSaving(true);

    try {
      if (isEdit && id) {
        await updateProduct(id, payload);
      } else {
        await addProduct(payload);
      }

      navigate('/products', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEdit ? 'update' : 'add'} product.`,
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Loading product...</p>;
  }

  if (isEdit && error && !form.sku && !form.name) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => navigate('/products')}
          className="mt-3 rounded-md border px-4 py-2"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-md border border-gray-200 px-3 py-2 text-[15px]';

  const labelClass =
    'mb-1 block text-[14px] font-medium text-gray-800';

  return (
    <div className="mx-auto max-w-5xl text-left">
      <h2 className="mb-6 text-xl font-semibold">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* SKU */}
          <div>
            <label htmlFor="sku" className={labelClass}>
              SKU <span className="text-red-600">*</span>
            </label>

            <input
              id="sku"
              name="sku"
              type="text"
              maxLength={15}
              required
              value={form.sku}
              onChange={handleChange}
              placeholder="Enter SKU"
              className={inputClass}
            />
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Product Name <span className="text-red-600">*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              maxLength={200}
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={inputClass}
            />
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className={labelClass}>
              Unit <span className="text-red-600">*</span>
            </label>

            <input
              id="unit"
              name="unit"
              type="text"
              maxLength={10}
              required
              value={form.unit}
              onChange={handleChange}
              placeholder="PCS, KG, LTR, BOX"
              className={inputClass}
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label htmlFor="purchase_price" className={labelClass}>
              Purchase Price
            </label>

            <input
              id="purchase_price"
              name="purchase_price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.purchase_price}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Selling Price */}
          <div>
            <label htmlFor="selling_price" className={labelClass}>
              Selling Price
            </label>

            <input
              id="selling_price"
              name="selling_price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.selling_price}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Tax Rate */}
          <div>
            <label htmlFor="tax_rate" className={labelClass}>
              Tax Rate (%)
            </label>

            <input
              id="tax_rate"
              name="tax_rate"
              type="number"
              min="0"
              max="999.99"
              step="0.01"
              required
              value={form.tax_rate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label htmlFor="stock_quantity" className={labelClass}>
              Stock Quantity
            </label>

            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              step="0.001"
              required
              value={form.stock_quantity}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Minimum Stock */}
          <div>
            <label htmlFor="minimum_stock" className={labelClass}>
              Minimum Stock
            </label>

            <input
              id="minimum_stock"
              name="minimum_stock"
              type="number"
              min="0"
              step="0.001"
              required
              value={form.minimum_stock}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description ?? ''}
              onChange={handleChange}
              placeholder="Enter product description"
              className={inputClass}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p
            role="alert"
            className="pb-4 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : isEdit
                ? 'Update Product'
                : 'Save Product'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => navigate('/products')}
            className="rounded-md border px-5 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}