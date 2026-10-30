
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCustomer } from '../../api/customerAPI';
import type { CustomerForm } from '../../types/customerTypes';

type FormValues = Omit<
  CustomerForm,
  'credit_limit' | 'opening_balance'
> & {
  credit_limit: string;
  opening_balance: string;
};

const initialForm: FormValues = {
  customer_code: '',
  name: '',
  company_name: '',
  phone_1: '',
  phone_2: '',
  email: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
  tax_number: '',
  tax_number_type: '',
  credit_limit: '0',
  opening_balance: '0',
  status: 'ACTIVE',
};

const fields = [
  { name: 'customer_code', label: 'Customer Code', required: true },
  { name: 'name', label: 'Customer Name', required: true },
  { name: 'company_name', label: 'Company Name' },
  { name: 'phone_1', label: 'Phone 1', maxLength: 15 },
  { name: 'phone_2', label: 'Phone 2', maxLength: 15 },
  { name: 'email', label: 'Email', type: 'email', maxLength: 150 },
  { name: 'address_line_1', label: 'Address Line 1', maxLength: 255 },
  { name: 'address_line_2', label: 'Address Line 2', maxLength: 255 },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'zipcode', label: 'ZIP Code', maxLength: 10 },
  { name: 'country', label: 'Country' },
  { name: 'tax_number', label: 'Tax Number', maxLength: 50 },
  { name: 'tax_number_type', label: 'Tax Number Type', maxLength: 30 },
//   { name: 'credit_limit', label: 'Credit Limit', type: 'number' },
//   { name: 'opening_balance', label: 'Opening Balance', type: 'number' },
] as const;

export default function AddCustomer() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormValues>(initialForm);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();
    setError('');

    if (!form.customer_code.trim() || !form.name.trim()) {
      setError('Customer code and name are required.');
      return;
    }

    const creditLimit = Number(form.credit_limit);
    const openingBalance = Number(form.opening_balance);

    if (
      !Number.isFinite(creditLimit) ||
      !Number.isFinite(openingBalance) ||
      creditLimit < 0 ||
      openingBalance < 0
    ) {
      setError('Enter valid, non-negative credit and balance amounts.');
      return;
    }

    setSaving(true);

    try {
      const payload: CustomerForm = {
        ...form,
        customer_code: form.customer_code.trim(),
        name: form.name.trim(),
        credit_limit: creditLimit,
        opening_balance: openingBalance,
      };

      await addCustomer(payload);

      navigate('/customers', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add customer.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h3 className="mb-6 text-2xl font-semibold">
        Add Customer
      </h3>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-1 block text-sm font-medium text-left"
              >
                {field.label}
                {'required' in field && field.required && (
                  <span className="text-red-600"> *</span>
                )}
              </label>

              <input
                id={field.name}
                name={field.name}
                type={'type' in field ? field.type : 'text'}
                required={'required' in field && field.required}
                maxLength={'maxLength' in field ? field.maxLength : undefined}
                min={
                  'type' in field && field.type === 'number'
                    ? 0
                    : undefined
                }
                step={
                  'type' in field && field.type === 'number'
                    ? '0.01'
                    : undefined
                }
                value={form[field.name]}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          ))}

          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-left"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Customer'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => navigate('/customers')}
            className="rounded-md border px-5 py-2 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
