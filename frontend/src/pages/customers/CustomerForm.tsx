
import { useEffect, useState } from 'react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  addCustomer,
  getCustomerById,
  updateCustomer,
} from '../../api/customerAPI';

import type {
  Customer,
  CustomerForm as CustomerFormType,
} from '../../types/customerTypes';

type FormValues = Omit<
  CustomerFormType,
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
  state_code: '',
  zipcode: '',
  country: 'India',
  tax_number: '',
  tax_number_type: '',
  credit_limit: '0',
  opening_balance: '0',
  status: 'ACTIVE',
};

const fields = [
  { name: 'customer_code', label: 'Customer Code', maxLength: 10, required: true },
  { name: 'name', label: 'Customer Name', maxLength: 150, required: true },
  { name: 'company_name', label: 'Company Name', maxLength: 150, required: true },
  { name: 'phone_1', label: 'Phone 1', maxLength: 12, required: true },
  { name: 'phone_2', label: 'Phone 2', maxLength: 12 },
  { name: 'email', label: 'Email', type: 'email', maxLength: 150 },
  { name: 'address_line_1', label: 'Address Line 1', maxLength: 255, required: true },
  { name: 'address_line_2', label: 'Address Line 2', maxLength: 255, required: true },
  { name: 'city', label: 'City', maxLength: 150, required: true },
  //{ name: 'state', label: 'State', required: true },
  { name: 'state_code', label: 'State Code', maxLength: 2, required: true },
  { name: 'zipcode', label: 'ZIP Code', maxLength: 6, required: true },
  { name: 'country', label: 'Country', maxLength: 150, required: true },
  { name: 'tax_number', label: 'Tax Number', maxLength: 50, required: true },
  { name: 'tax_number_type', label: 'Tax Number Type', maxLength: 30 },
 // { name: 'credit_limit', label: 'Credit Limit', type: 'number' },
 // { name: 'opening_balance', label: 'Opening Balance', type: 'number' },
] as const;

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
];

function validateEmail(email: string): boolean {
  if (!email.trim()) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  if (!phone.trim()) return true;

  //return /^[6-9]\d{9}$/.test(phone.trim());
  // if (!/^[6-9]\d{9}$/.test(phone)) {
  //   return false;
  // }

  return /^[6-9][0-9]{9}$/.test(phone.trim());

}

function validateZipcode(zipcode: string): boolean {
  if (!zipcode.trim()) return true;

  return /^[1-9]\d{5}$/.test(zipcode.trim());
}

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormValues>(initialForm);

  // Load existing customer when editing
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getCustomerById(id)
      .then(({ customer }: { customer: Customer }) => {
        if (cancelled) return;

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
          state_code: customer.state_code ?? '',
          zipcode: customer.zipcode ?? '',
          country: customer.country ?? '',
          tax_number: customer.tax_number ?? '',
          tax_number_type: customer.tax_number_type ?? '',
          credit_limit: String(customer.credit_limit ?? 0),
          opening_balance: String(customer.opening_balance ?? 0),
          status: customer.status,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    // Allow numbers only for phone and PIN code
    if (
      ['phone_1', 'phone_2', 'zipcode'].includes(name) &&
      !/^\d*$/.test(value)
    ) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Handle form submission
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();
    setError('');

    if (!form.customer_code.trim() || !form.name.trim() || !form.company_name.trim()) {
      setError('Customer code, comapny name and name are required.');
      return;
    }

    if (!form.state.trim()) {
      setError('Please select a state.');
      return;
    }

    // if (!form.state_code.trim() &&
    // !/^[0-9]{2}$/.test(form.state_code.trim())
    // ) {
    // setError(
    //     'State code must contain 2 digits.',
    //   );
    //   return;
    // }

    // Phone validation
    if (!validatePhone(form.phone_1)) {
      setError(
        'Enter a valid mobile number for Phone 1.',
      );
      return;
    }

    if (!validatePhone(form.phone_2)) {
      setError(
        'Enter a valid mobile number for Phone 2.',
      );
      return;
    }

    // Email validation
    if (!validateEmail(form.email)) {
      setError('Enter a valid email address.');
      return;
    }

    // PIN code validation
    if (!validateZipcode(form.zipcode)) {
      setError(
        'Enter a valid 6-digit Indian PIN code.',
      );
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

    const payload: CustomerFormType = {
      ...form,
      customer_code: form.customer_code.trim(),
      name: form.name.trim(),
      credit_limit: creditLimit,
      opening_balance: openingBalance,
    };

    setSaving(true);

    try {
      if (isEdit && id) {
        await updateCustomer(id, payload);
      } else {
        await addCustomer(payload);
      }

      navigate('/customers', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEdit ? 'update' : 'add'} customer.`,
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Loading customer...</p>;
  }

  if (isEdit && error && !form.customer_code && !form.name) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/customers')}
          className="mt-3 rounded-md border px-4 py-2"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl text-left">

      <h2 className="mb-6 text-xl font-semibold">
        {isEdit ? 'Edit Customer' : 'Add Customer'}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800"
      >

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {fields.map((field) => (
            <React.Fragment key={field.name}>
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-[14px] font-medium text-gray-800"
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
                  value={form[field.name]}
                  onChange={handleChange}
                  className="w-full rounded-md border px-3 py-2 border-gray-200 text-[15px]"
                />
              </div>

              {/* State dropdown immediately after City */}
              {field.name === 'city' && (
                <div>
                  <label
                    htmlFor="state"
                    className="mb-1 block text-[14px] font-medium text-gray-800"
                  >
                    State <span className="text-red-600">*</span>
                  </label>

                  <select
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2 border-gray-200 text-[15px]"
                  >
                    <option value="">Select State</option>

                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Status dropdown */}
          <div>
            <label htmlFor="status" className="mb-1 block text-[14px] font-medium">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 border-gray-200 text-[15px]"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

        </div>

        {/* Error Message */}
        {error && (
          <p role="alert" className="text-sm text-red-600 pb-4"
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
                ? 'Update Customer'
                : 'Save Customer'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => navigate('/customers')}
            className="rounded-md border px-5 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}
