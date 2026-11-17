import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuotationById } from '../../api/quotationAPI';
import type { Quotation } from '../../types/quotationTypes';

export default function ViewQuotation() {
  const { id } = useParams<{ id: string }>();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      setError('Invalid quotation ID');
      setLoading(false);
      return;
    }

    getQuotationById(Number(id))
      .then(setQuotation)
      .catch(() => setError('Unable to load quotation'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !quotation) {
    return <div className="p-6 text-red-600">{error || 'Quotation not found'}</div>;
  }

  const amount = (value: number | string) =>
    Number(value || 0).toFixed(2);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {quotation.quotation_no}
        </h1>
        <Link to="/quotations" className="rounded border px-4 py-2">
          Back
        </Link>
      </div>

      <div className="rounded border bg-white p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">{quotation.customer_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quotation Date</p>
            <p>{String(quotation.quotation_date).slice(0, 10)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Valid Until</p>
            <p>
              {quotation.valid_until
                ? String(quotation.valid_until).slice(0, 10)
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p>{quotation.status}</p>
          </div>
        </div>

        <h2 className="mb-3 mt-8 font-semibold">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-right">Quantity</th>
                <th className="p-2 text-left">Unit</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-right">Discount</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items?.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2">{item.unit}</td>
                  <td className="p-2 text-right">{amount(item.unit_price)}</td>
                  <td className="p-2 text-right">
                    {amount(item.discount_amount)}
                  </td>
                  <td className="p-2 text-right">
                    {amount(item.total_amount ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-6 max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal after item discounts</span>
            <span>{amount(quotation.subtotal)}</span>
          </div>
          {Number(quotation.cgst_rate) > 0 && (
            <div className="flex justify-between">
              <span>CGST ({quotation.cgst_rate}%)</span>
              <span>{amount(quotation.cgst_amount)}</span>
            </div>
          )}
          {Number(quotation.sgst_rate) > 0 && (
            <div className="flex justify-between">
              <span>SGST ({quotation.sgst_rate}%)</span>
              <span>{amount(quotation.sgst_amount)}</span>
            </div>
          )}
          {Number(quotation.igst_rate) > 0 && (
            <div className="flex justify-between">
              <span>IGST ({quotation.igst_rate}%)</span>
              <span>{amount(quotation.igst_amount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-3 text-lg font-semibold">
            <span>Grand Total</span>
            <span>{amount(quotation.total_amount)}</span>
          </div>
        </div>

        {quotation.notes && (
          <div className="mt-8">
            <h2 className="font-semibold">Notes</h2>
            <p className="mt-2 whitespace-pre-wrap">{quotation.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}