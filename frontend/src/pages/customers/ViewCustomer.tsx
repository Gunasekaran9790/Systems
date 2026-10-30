
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCustomerById } from '../../api/customerAPI';
import type { Customer } from '../../types/customerTypes';

export default function ViewCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    getCustomerById(id)
      .then((data) => setCustomer(data.customer))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading customer...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!customer) return <p className="p-6">Customer not found.</p>;

  const details = [
    ['Customer Code', customer.customer_code],
    ['Customer Name', customer.name],
    ['Company Name', customer.company_name],
    ['Phone 1', customer.phone_1],
    ['Phone 2', customer.phone_2],
    ['Email', customer.email],
    ['Address Line 1', customer.address_line_1],
    ['Address Line 2', customer.address_line_2],
    ['City', customer.city],
    ['State', customer.state],
    ['ZIP Code', customer.zipcode],
    ['Country', customer.country],
    ['Tax Number', customer.tax_number],
    ['Tax Number Type', customer.tax_number_type],
    ['Credit Limit', customer.credit_limit],
    ['Opening Balance', customer.opening_balance],
    ['Status', customer.status],
  ];

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customer Details</h1>

        <div className="flex gap-3">
          <Link
            to={`/customers/edit/${customer.id}`}
            className="rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Edit Customer
          </Link>

          <button
            onClick={() => navigate('/customers')}
            className="rounded-md border px-4 py-2"
          >
            Back
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 font-medium">
                {value ?? '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
