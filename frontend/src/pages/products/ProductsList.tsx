import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getProducts,
  deleteProduct,
  updateProductStatus,
} from '../../api/productAPI';

import type { Product } from '../../types/productTypes';

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setError('');

      const data = await getProducts();

      setProducts(data.products);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load products.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${product.name}?`,
    );

    if (!confirmed) return;

    const id = String(product.id);

    setActionId(id);
    setError('');

    try {
      await deleteProduct(product.id);

      setProducts((prev) =>
        prev.filter((item) => String(item.id) !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete product.',
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleStatusChange(
    product: Product,
    status: 'ACTIVE' | 'INACTIVE',
  ) {
    const id = String(product.id);

    setActionId(id);
    setError('');

    try {
      await updateProductStatus(product.id, status);

      setProducts((prev) =>
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
          : 'Failed to update product status.',
      );
    } finally {
      setActionId(null);
    }
  }

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase().trim();

    return [
      product.sku,
      product.name,
      product.description,
      product.unit,
    ].some((value) =>
      value?.toLowerCase().includes(term),
    );
  });

  if (loading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="p-6--">
      {/* Header */}
      <div className="text-left mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            All Products
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your products and inventory information.
          </p>
        </div>

        <Link
          to="/products/add"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add Product
        </Link>
      </div>

      {/* Search and count */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border px-3 py-2 md:w-80"
        />

        <span className="text-sm text-gray-500">
          Total Products: {products.length}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="whitespace-nowrap p-3">#</th>
              <th className="whitespace-nowrap p-3">SKU</th>
              <th className="whitespace-nowrap p-3">Product Name</th>
              <th className="whitespace-nowrap p-3">Unit</th>
              <th className="whitespace-nowrap p-3">Purchase Price</th>
              <th className="whitespace-nowrap p-3">Selling Price</th>
              <th className="whitespace-nowrap p-3">Tax %</th>
              <th className="whitespace-nowrap p-3">Stock</th>
              <th className="whitespace-nowrap p-3">Min. Stock</th>
              <th className="whitespace-nowrap p-3">Status</th>
              <th className="whitespace-nowrap p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product, index) => {
              const busy = actionId === String(product.id);

              return (
                <tr
                  key={product.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">{index + 1}</td>

                  <td className="whitespace-nowrap p-3 font-medium">
                    {product.sku}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {product.name}
                  </td>

                  <td className="p-3">
                    {product.unit}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {Number(product.purchase_price).toFixed(2)}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {Number(product.selling_price).toFixed(2)}
                  </td>

                  <td className="p-3">
                    {Number(product.tax_rate).toFixed(2)}%
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {Number(product.stock_quantity).toFixed(3)}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {Number(product.minimum_stock).toFixed(3)}
                  </td>

                  <td className="p-3">
                    <select
                      value={product.status}
                      disabled={busy}
                      onChange={(e) =>
                        handleStatusChange(
                          product,
                          e.target.value as 'ACTIVE' | 'INACTIVE',
                        )
                      }
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        product.status === 'ACTIVE'
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
                        to={`/products/view/${product.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>

                      <Link
                        to={`/products/edit/${product.id}`}
                        className="text-green-600 hover:underline"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        {busy ? 'Wait...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="p-8 text-center text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}