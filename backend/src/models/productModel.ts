import db from '../config/db';

import type { ProductInput } from '../validators/productValidator';

// Get all products
export async function getAllProducts() {
  const [rows] = await db.execute(
    `SELECT * FROM products ORDER BY id DESC`,
  );

  return rows;
}

// Check whether SKU already exists
async function checkSkuExists(
  sku: string,
  excludeId?: string,
): Promise<boolean> {
  let sql = `
    SELECT id
    FROM products
    WHERE sku = ?
  `;

  const params: (string | number)[] = [sku];

  // Exclude current product while editing
  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }

  sql += ' LIMIT 1';

  const [rows] = await db.execute(sql, params);

  return (rows as any[]).length > 0;
}

// Create Product
export async function createProduct(data: ProductInput) {
  const sku = data.sku.trim();

  try {
    const exists = await checkSkuExists(sku);

    if (exists) {
      throw new Error(
        'SKU already exists. Please enter a different SKU.',
      );
    }

    const [result] = await db.execute(
      `INSERT INTO products (
        sku,
        name,
        description,
        unit,
        purchase_price,
        selling_price,
        tax_rate,
        stock_quantity,
        minimum_stock,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sku,
        data.name.trim(),
        data.description?.trim() || null,
        data.unit.trim().toUpperCase(),
        data.purchase_price,
        data.selling_price,
        data.tax_rate,
        data.stock_quantity,
        data.minimum_stock,
        data.status,
      ],
    );

    return result;
  } catch (err) {
    const error = err as {
      code?: string;
      message?: string;
    };

    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error(
        'SKU already exists. Please enter a different SKU.',
      );
    }

    throw err;
  }
}

// Get Product By ID
export async function getProductById(id: string) {
  const [rows] = await db.execute(
    'SELECT * FROM products WHERE id = ?',
    [id],
  );

  return (rows as any[])[0] || null;
}

// Update Product
export async function updateProduct(
  id: string,
  data: ProductInput,
) {
  const sku = data.sku.trim();

  try {
    // Check duplicate SKU excluding current product
    const exists = await checkSkuExists(sku, id);

    if (exists) {
      throw new Error(
        'SKU already exists. Please enter a different SKU.',
      );
    }

    const [result] = await db.execute(
      `UPDATE products SET
        sku = ?,
        name = ?,
        description = ?,
        unit = ?,
        purchase_price = ?,
        selling_price = ?,
        tax_rate = ?,
        stock_quantity = ?,
        minimum_stock = ?,
        status = ?
      WHERE id = ?`,
      [
        sku,
        data.name.trim(),
        data.description?.trim() || null,
        data.unit.trim().toUpperCase(),
        data.purchase_price,
        data.selling_price,
        data.tax_rate,
        data.stock_quantity,
        data.minimum_stock,
        data.status,
        id,
      ],
    );

    return result;
  } catch (err) {
    const error = err as {
      code?: string;
      message?: string;
    };

    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error(
        'SKU already exists. Please enter a different SKU.',
      );
    }

    throw err;
  }
}

// Update Product Status
export async function updateProductStatus(
  id: string,
  status: 'ACTIVE' | 'INACTIVE',
) {
  const [result] = await db.execute(
    'UPDATE products SET status = ? WHERE id = ?',
    [status, id],
  );

  return result;
}

// Delete Product
export async function deleteProduct(id: string) {
  const [result] = await db.execute(
    'DELETE FROM products WHERE id = ?',
    [id],
  );

  return result;
}