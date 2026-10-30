
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getCustomers,
  deleteCustomer,
  updateCustomerStatus,
} from '../../api/customerAPI';

import type { Customer } from '../../types/customerTypes';

export default function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      setError('');
      const data = await getCustomers();
      setCustomers(data.customers);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load customers.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`,
    );

    if (!confirmed) return;

    const id = String(customer.id);
    setActionId(id);
    setError('');

    try {
      await deleteCustomer(customer.id);

      setCustomers((prev) =>
        prev.filter((item) => String(item.id) !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete customer.',
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleStatusChange(
    customer: Customer,
    status: 'ACTIVE' | 'INACTIVE',
  ) {
    const id = String(customer.id);
    setActionId(id);
    setError('');

    try {
      await updateCustomerStatus(customer.id, status);

      setCustomers((prev) =>
        prev.map((item) =>
          String(item.id) === id
            ? { ...item, status }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update status.',
      );
    } finally {
      setActionId(null);
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const term = search.toLowerCase().trim();

    return [
      customer.customer_code,
      customer.name,
      customer.company_name,
      customer.phone_1,
      customer.email,
      customer.city,
    ].some((value) =>
      value?.toLowerCase().includes(term),
    );
  });

  if (loading) {
    return <div className="p-6">Loading customers...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            All Customers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customers and their information.
          </p>
        </div>

        <Link
          to="/customers/add"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add Customer
        </Link>
      </div>

      {/* Search and count */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border px-3 py-2 md:w-80"
        />

        <span className="text-sm text-gray-500">
          Total Customers: {customers.length}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* Customer table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="whitespace-nowrap p-3">#</th>
              <th className="whitespace-nowrap p-3">Customer Code</th>
              <th className="whitespace-nowrap p-3">Customer Name</th>
              <th className="whitespace-nowrap p-3">Company</th>
              <th className="whitespace-nowrap p-3">Phone</th>
              <th className="whitespace-nowrap p-3">Email</th>
              <th className="whitespace-nowrap p-3">City</th>
              <th className="whitespace-nowrap p-3">Status</th>
              <th className="whitespace-nowrap p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((customer, index) => {
              const busy =
                actionId === String(customer.id);

              return (
                <tr
                  key={customer.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">{index + 1}</td>

                  <td className="whitespace-nowrap p-3 font-medium">
                    {customer.customer_code}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {customer.name}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {customer.company_name || '-'}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {customer.phone_1 || '-'}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {customer.email || '-'}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {customer.city || '-'}
                  </td>

                  <td className="p-3">
                    <select
                      value={customer.status}
                      disabled={busy}
                      onChange={(e) =>
                        handleStatusChange(
                          customer,
                          e.target.value as 'ACTIVE' | 'INACTIVE',
                        )
                      }
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        customer.status === 'ACTIVE'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </td>

                  <td className="whitespace-nowrap p-3">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        to={`/customers/view/${customer.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>

                      <Link
                        to={`/customers/edit/${customer.id}`}
                        className="text-green-600 hover:underline"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(customer)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        {busy ? 'Wait...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="p-8 text-center text-gray-500"
                >
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
    </div>
  );
}
