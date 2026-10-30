
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getCustomerById,
  updateCustomer,
} from '../../api/customerAPI';

import type {
  Customer,
  CustomerForm,
} from '../../types/customerTypes';

type FormValues = Omit<
  CustomerForm,
  'credit_limit' | 'opening_balance'
> & {
  credit_limit: string;
  opening_balance: string;
};

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormValues>({
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
  });

  useEffect(() => {
    if (!id) return;

    getCustomerById(id)
      .then(({ customer }: { customer: Customer }) => {
        setForm({
          customer_code: customer.customer_code,
          name: customer.name,
          company_name: customer.company_name ?? '',
          phone_1: customer.phone_1 ?? '',
          phone_2: customer.phone_2 ?? '',
          email: customer.email ?? '',
          address_line_1: customer.address_line_1 ?? '',
          address_line_2: customer.address_line_2 ?? '',
          city: customer.city ?? '',
          state: customer.state ?? '',
          zipcode: customer.zipcode ?? '',
          country: customer.country ?? '',
          tax_number: customer.tax_number ?? '',
          tax_number_type: customer.tax_number_type ?? '',
          credit_limit: String(customer.credit_limit ?? 0),
          opening_balance: String(customer.opening_balance ?? 0),
          status: customer.status,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

    if (!id) return;

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
      setError('Enter valid, non-negative amounts.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload: CustomerForm = {
        ...form,
        customer_code: form.customer_code.trim(),
        name: form.name.trim(),
        credit_limit: creditLimit,
        opening_balance: openingBalance,
      };

      await updateCustomer(id, payload);

      navigate('/customers');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update customer.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6">Loading customer...</p>;

  if (error && !form.customer_code && !form.name) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">
        Edit Customer
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Object.entries(form).map(([key, value]) => (
            <div key={key}>
              <label
                htmlFor={key}
                className="mb-1 block text-sm font-medium capitalize"
              >
                {key.replaceAll('_', ' ')}
              </label>

              {key === 'status' ? (
                <select
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              ) : (
                <input
                  id={key}
                  name={key}
                  type={
                    key === 'credit_limit' ||
                    key === 'opening_balance'
                      ? 'number'
                      : key === 'email'
                        ? 'email'
                        : 'text'
                  }
                  min={
                    key === 'credit_limit' ||
                    key === 'opening_balance'
                      ? 0
                      : undefined
                  }
                  step={
                    key === 'credit_limit' ||
                    key === 'opening_balance'
                      ? '0.01'
                      : undefined
                  }
                  value={value}
                  onChange={handleChange}
                  className="w-full rounded-md border px-3 py-2"
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Customer'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => navigate('/customers')}
            className="rounded-md border px-5 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
