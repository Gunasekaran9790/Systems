import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI } from '../../api/companyAPI';
import {
  addQuotation,
  searchQuotationCustomers,
  searchQuotationProducts,
} from '../../api/quotationAPI';
import type {
  QuotationCustomer,
  QuotationFormData,
  QuotationProduct,
} from '../../types/quotationTypes';
import { validateQuotation } from '../../utils/quotationValidation';

const initialForm: QuotationFormData = {
  customer_id: 0,
  quotation_date: new Date().toISOString().slice(0, 10),
  valid_until: null,
  notes: '',
  cgst_rate: 0,
  sgst_rate: 0,
  igst_rate: 0,
  items: [],
};

const formatAmount = (value: number) =>
  Number(value || 0).toFixed(2);

export default function QuotationForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<QuotationFormData>(initialForm);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [customers, setCustomers] = useState<QuotationCustomer[]>([]);
  const [products, setProducts] = useState<QuotationProduct[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<QuotationCustomer | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [companyStateCode, setCompanyStateCode] = useState('');
  const [companySettingsLoaded, setCompanySettingsLoaded] = useState(false);

  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomers([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setCustomers(await searchQuotationCustomers(customerSearch));
      } catch {
        setMessage('Unable to search customers');
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [customerSearch]);

  useEffect(() => {
    if (!productSearch.trim()) {
      setProducts([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setProducts(await searchQuotationProducts(productSearch));
      } catch {
        setMessage('Unable to search products');
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [productSearch]);

  useEffect(() => {
    let cancelled = false;

    companyAPI.getCompany()
      .then(({ company }) => {
        if (!cancelled) {
          setCompanyStateCode(company?.state_code?.trim() ?? '');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage('Unable to load company settings.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCompanySettingsLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isSameState = Boolean(
    companyStateCode &&
    selectedCustomer?.state_code &&
    companyStateCode === selectedCustomer.state_code,
  );

  const subtotal = useMemo(
    () =>
      form.items.reduce((sum, item) => {
        const gross = item.quantity * item.unit_price;
        return sum + Math.max(0, gross - item.discount_amount);
      }, 0),
    [form.items],
  );

  const discountTotal = useMemo(
    () => form.items.reduce((sum, item) => sum + item.discount_amount, 0),
    [form.items],
  );

  const cgstAmount = isSameState
    ? subtotal * form.cgst_rate / 100
    : 0;

  const sgstAmount = isSameState
    ? subtotal * form.sgst_rate / 100
    : 0;

  const igstAmount = !isSameState
    ? subtotal * form.igst_rate / 100
    : 0;

  const taxTotal = cgstAmount + sgstAmount + igstAmount;
  const grandTotal = subtotal + taxTotal;

  const selectCustomer = (customer: QuotationCustomer) => {
    setSelectedCustomer(customer);
    setForm((prev) => ({ ...prev, customer_id: customer.id }));
    setCustomerSearch(
      `${customer.customer_code} - ${customer.name}`,
    );
    setCustomers([]);
    setErrors((prev) => ({ ...prev, customer_id: '' }));

    // Clear the rates that are not applicable to the new customer.
    setForm((prev) => ({
      ...prev,
      customer_id: customer.id,
      cgst_rate: 0,
      sgst_rate: 0,
      igst_rate: 0,
    }));
  };

  const addProduct = (product: QuotationProduct) => {
    const existing = form.items.find(
      (item) => item.product_id === product.id,
    );

    if (existing) {
      setForm((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            product_id: product.id,
            description: product.name,
            quantity: 1,
            unit: product.unit || 'PCS',
            unit_price: Number(product.selling_price) || 0,
            discount_amount: 0,
          },
        ],
      }));
    }

    setProductSearch('');
    setProducts([]);
  };

  const updateItem = (
    index: number,
    field: string,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? { ...item, [field]: field === 'description' || field === 'unit'
              ? value
              : Number(value) }
          : item,
      ),
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const saveQuotation = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!companySettingsLoaded) {
      setMessage('Company settings are still loading. Please try again.');
      return;
    }

    if (!companyStateCode) {
      setMessage('Company state code is not configured in company settings.');
      return;
    }

    const validationErrors = validateQuotation(form, isSameState);
    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) {
      setMessage('Please correct the highlighted errors.');
      return;
    }

    try {
      setLoading(true);

      await addQuotation({
        ...form,
        cgst_rate: isSameState ? form.cgst_rate : 0,
        sgst_rate: isSameState ? form.sgst_rate : 0,
        igst_rate: isSameState ? 0 : form.igst_rate,
      });

      navigate('/quotations');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save quotation',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6-">
      <div className="text-left mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Create Quotation</h2>
        <button
          type="button"
          onClick={() => navigate('/quotations')}
          className="rounded border px-4 py-2"
        >
          Back
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded bg-red-50 p-3 text-red-700">
          {message}
        </div>
      )}

      <form onSubmit={saveQuotation} className="space-y-6">
        <section className="rounded border bg-white p-5">
          <h2 className="mb-4 font-semibold">Quotation Details</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Customer *
              </label>
              <input
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setSelectedCustomer(null);
                  setForm((prev) => ({ ...prev, customer_id: 0 }));
                }}
                placeholder="Search customer"
                className="w-full rounded border p-2"
              />
              {errors.customer_id && (
                <p className="text-sm text-red-600">{errors.customer_id}</p>
              )}

              {customers.length > 0 && (
                <div className="mt-1 max-h-48 overflow-auto rounded border bg-white">
                  {customers.map((customer) => (
                    <button
                      type="button"
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="block w-full border-b p-2 text-left hover:bg-gray-50"
                    >
                      {customer.customer_code} - {customer.name}
                      <span className="block text-xs text-gray-500">
                        {customer.state || 'State not set'} ({customer.state_code || 'No state code'})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Quotation Date *
              </label>
              <input
                type="date"
                value={form.quotation_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    quotation_date: e.target.value,
                  }))
                }
                className="w-full rounded border p-2"
              />
              {errors.quotation_date && (
                <p className="text-sm text-red-600">
                  {errors.quotation_date}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Valid Until
              </label>
              <input
                type="date"
                value={form.valid_until || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    valid_until: e.target.value || null,
                  }))
                }
                className="w-full rounded border p-2"
              />
              {errors.valid_until && (
                <p className="text-sm text-red-600">{errors.valid_until}</p>
              )}
            </div>
          </div>

          {selectedCustomer && (
            <p className="mt-3 text-sm text-gray-600">
              Customer state: {selectedCustomer.state || 'Not set'} · State code:{' '}
              {selectedCustomer.state_code || 'Not set'}
            </p>
          )}
        </section>

        <section className="rounded border bg-white p-5">
          <h2 className="mb-4 font-semibold">Quotation Items</h2>

          <input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search product by name or SKU"
            className="mb-2 w-full rounded border p-2"
          />

          {products.length > 0 && (
            <div className="mb-4 rounded border">
              {products.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="flex w-full justify-between border-b p-3 text-left hover:bg-gray-50"
                >
                  <span>{product.sku} - {product.name}</span>
                  <span>{formatAmount(Number(product.selling_price))}</span>
                </button>
              ))}
            </div>
          )}

          {errors.items && (
            <p className="mb-2 text-sm text-red-600">{errors.items}</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Unit</th>
                  <th className="border p-2">Unit Price</th>
                  <th className="border p-2">Discount</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, index) => {
                  const lineTotal = Math.max(
                    0,
                    item.quantity * item.unit_price - item.discount_amount,
                  );

                  return (
                    <tr key={`${item.product_id ?? 'manual'}-${index}`}>
                      <td className="border p-2">
                        <input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(index, 'description', e.target.value)
                          }
                          className="w-full rounded border p-1"
                        />
                        {errors[`item_${index}_description`] && (
                          <p className="text-xs text-red-600">
                            {errors[`item_${index}_description`]}
                          </p>
                        )}
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, 'quantity', e.target.value)
                          }
                          className="w-20 rounded border p-1"
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-xs text-red-600">
                            {errors[`item_${index}_quantity`]}
                          </p>
                        )}
                      </td>
                      <td className="border p-2">
                        <input
                          value={item.unit}
                          onChange={(e) =>
                            updateItem(index, 'unit', e.target.value)
                          }
                          className="w-20 rounded border p-1"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(index, 'unit_price', e.target.value)
                          }
                          className="w-24 rounded border p-1"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount_amount}
                          onChange={(e) =>
                            updateItem(index, 'discount_amount', e.target.value)
                          }
                          className="w-24 rounded border p-1"
                        />
                        {errors[`item_${index}_discount`] && (
                          <p className="text-xs text-red-600">
                            {errors[`item_${index}_discount`]}
                          </p>
                        )}
                      </td>
                      <td className="border p-2 text-right">
                        {formatAmount(lineTotal)}
                      </td>
                      <td className="border p-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded border bg-white p-5">
          <h2 className="mb-4 font-semibold">GST Details</h2>

          {!selectedCustomer ? (
            <p className="text-sm text-gray-500">
              Select a customer to determine the GST type.
            </p>
          ) : !companySettingsLoaded ? (
            <p className="text-sm text-gray-500">
              Loading company settings...
            </p>
          ) : !companyStateCode || !selectedCustomer.state_code ? (
            <p className="text-sm text-red-600">
              Company and customer state codes must both be configured before GST can be calculated.
            </p>
          ) : isSameState ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">CGST Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.cgst_rate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cgst_rate: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded border p-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">SGST Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.sgst_rate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sgst_rate: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded border p-2"
                />
              </div>
            </div>
          ) : (
            <div className="max-w-sm">
              <label className="mb-1 block text-sm">IGST Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.igst_rate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    igst_rate: Number(e.target.value),
                  }))
                }
                className="w-full rounded border p-2"
              />
            </div>
          )}

          {errors.gst && (
            <p className="mt-2 text-sm text-red-600">{errors.gst}</p>
          )}
        </section>

        <section className="rounded border bg-white p-5">
          <h2 className="mb-4 font-semibold">Notes and Summary</h2>

          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Quotation notes"
            className="mb-5 w-full rounded border p-2"
          />

          <div className="ml-auto max-w-sm space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Discount</span>
              <span>{formatAmount(discountTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal after item discounts</span>
              <span>{formatAmount(subtotal)}</span>
            </div>
            {isSameState ? (
              <>
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span>{formatAmount(cgstAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST</span>
                  <span>{formatAmount(sgstAmount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>IGST</span>
                <span>{formatAmount(igstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3 text-lg font-semibold">
              <span>Grand Total</span>
              <span>{formatAmount(grandTotal)}</span>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/quotations')}
            className="rounded border px-5 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Quotation'}
          </button>
        </div>
      </form>
    </div>
  );
}