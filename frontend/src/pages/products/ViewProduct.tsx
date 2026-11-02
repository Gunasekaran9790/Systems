import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { getProductById } from '../../api/productAPI';

import type { Product } from '../../types/productTypes';

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Product ID is missing.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    getProductById(id)
      .then((data) => {
        if (!cancelled) {
          setProduct(data.product);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="p-6">Loading product...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!product) {
    return <p className="p-6">Product not found.</p>;
  }

  const details = [
    ['SKU', product.sku],
    ['Product Name', product.name],
    ['Description', product.description],
    ['Unit', product.unit],
    [
      'Purchase Price',
      Number(product.purchase_price).toFixed(2),
    ],
    [
      'Selling Price',
      Number(product.selling_price).toFixed(2),
    ],
    [
      'Tax Rate',
      `${Number(product.tax_rate).toFixed(2)}%`,
    ],
    [
      'Stock Quantity',
      Number(product.stock_quantity).toFixed(3),
    ],
    [
      'Minimum Stock',
      Number(product.minimum_stock).toFixed(3),
    ],
    ['Status', product.status],
    [
      'Created At',
      product.created_at
        ? new Date(product.created_at).toLocaleString()
        : '-',
    ],
    [
      'Updated At',
      product.updated_at
        ? new Date(product.updated_at).toLocaleString()
        : '-',
    ],
  ];

  return (
    <div className="mx-auto--max-w-5xl p-6--">

      {/* Header */}
      <div className="text-left mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          Product Details
        </h2>

        <div className="flex gap-3">
          <Link
            to={`/products/edit/${product.id}`}
            className="rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Edit Product
          </Link>

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="rounded-md border px-4 py-2"
          >
            Back
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="border-gray-200 rounded-lg border bg-white p-6">
        <div className="text-left grid grid-cols-1 gap-5 md:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <p className="text-sm text-gray-500 font-medium">
                {label} :
              </p>

              <p className="mt-1 whitespace-pre-wrap text-[14px]">
                {value ?? '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}