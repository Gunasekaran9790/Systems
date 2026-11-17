
import db from '../config/db';

export async function getAllCustomers() {
  const [rows] = await db.execute(
    `SELECT * FROM customers ORDER BY id DESC`
  );

  return rows;
}

// Check whether Customer Code already exists
async function checkCustomerCodeExists(
  customerCode: string,
  excludeId?: string
): Promise<boolean> {
  let sql = `
    SELECT id
    FROM customers
    WHERE customer_code = ?
  `;

  const params: (string | number)[] = [customerCode];

  // Exclude current customer while editing
  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }

  sql += ' LIMIT 1';

  const [rows] = await db.execute(sql, params);

  return (rows as any[]).length > 0;
}

export async function createCustomer(data: {
  customer_code: string;
  name: string;
  company_name?: string | null;
  phone_1?: string | null;
  phone_2?: string | null;
  email?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  state_code?: string | null;
  zipcode?: string | null;
  country?: string | null;
  tax_number?: string | null;
  tax_number_type?: string | null;
  credit_limit?: number;
  opening_balance?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}) {
  const customerCode = data.customer_code.trim();

  try {
    const exists = await checkCustomerCodeExists(customerCode);

    if (exists) {
      throw new Error(
        'Customer Code already exists. Please enter a different Customer Code.'
      );
    }

    const [result] = await db.execute(
      `INSERT INTO customers (
        customer_code, name, company_name, phone_1, phone_2,
        email, address_line_1, address_line_2, city, state, state_code,
        zipcode, country, tax_number, tax_number_type,
        credit_limit, opening_balance, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerCode,
        data.name,
        data.company_name ?? null,
        data.phone_1 ?? null,
        data.phone_2 ?? null,
        data.email ?? null,
        data.address_line_1 ?? null,
        data.address_line_2 ?? null,
        data.city ?? null,
        data.state ?? null,
        data.state_code ?? null,
        data.zipcode ?? null,
        data.country ?? null,
        data.tax_number ?? null,
        data.tax_number_type ?? null,
        data.credit_limit ?? 0,
        data.opening_balance ?? 0,
        data.status ?? 'ACTIVE',
      ]
    );

    return result;

  } catch (err) {
    const error = err as { code?: string; message?: string };

    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error(
        'Customer Code already exists. Please enter a different Customer Code.'
      );
    }

    throw err;
  }
}

export async function getCustomerById(id: string) {
  const [rows] = await db.execute(
    'SELECT * FROM customers WHERE id = ?',
    [id]
  );

  return (rows as any[])[0] || null;
}

// Update Customer
export async function updateCustomer(id: string, data: any) {
  const customerCode = String(data.customer_code ?? '').trim();

  try {
    // Check duplicate Customer Code, excluding current customer
    const exists = await checkCustomerCodeExists(customerCode, id);

    if (exists) {
      throw new Error(
        'Customer Code already exists. Please enter a different Customer Code.'
      );
    }

    const [result] = await db.execute(
      `UPDATE customers SET
        customer_code = ?,
        name = ?,
        company_name = ?,
        phone_1 = ?,
        phone_2 = ?,
        email = ?,
        address_line_1 = ?,
        address_line_2 = ?,
        city = ?,
        state = ?,
        state_code = ?,
        zipcode = ?,
        country = ?,
        tax_number = ?,
        tax_number_type = ?,
        credit_limit = ?,
        opening_balance = ?,
        status = ?
      WHERE id = ?`,
      [
        customerCode,
        data.name,
        data.company_name || null,
        data.phone_1 || null,
        data.phone_2 || null,
        data.email || null,
        data.address_line_1 || null,
        data.address_line_2 || null,
        data.city || null,
        data.state || null,
        data.state_code || null,
        data.zipcode || null,
        data.country || null,
        data.tax_number || null,
        data.tax_number_type || null,
        data.credit_limit ?? 0,
        data.opening_balance ?? 0,
        data.status,
        id,
      ]
    );

    return result;

  } catch (err) {
    const error = err as { code?: string; message?: string };

    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error(
        'Customer Code already exists. Please enter a different Customer Code.'
      );
    }

    throw err;
  }
}

export async function updateCustomerStatus(
  id: string,
  status: 'ACTIVE' | 'INACTIVE'
) {
  const [result] = await db.execute(
    'UPDATE customers SET status = ? WHERE id = ?',
    [status, id]
  );

  return result;
}

export async function deleteCustomer(id: string) {
  const [result] = await db.execute(
    'DELETE FROM customers WHERE id = ?',
    [id]
  );

  return result;
}
