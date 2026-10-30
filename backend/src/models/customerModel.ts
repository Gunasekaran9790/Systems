
import db from '../config/db';

export async function getAllCustomers() {
  const [rows] = await db.execute(
    `SELECT * FROM customers ORDER BY id DESC`
  );

  return rows;
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
  zipcode?: string | null;
  country?: string | null;
  tax_number?: string | null;
  tax_number_type?: string | null;
  credit_limit?: number;
  opening_balance?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}) {
  const [result] = await db.execute(
    `INSERT INTO customers (
      customer_code, name, company_name, phone_1, phone_2,
      email, address_line_1, address_line_2, city, state,
      zipcode, country, tax_number, tax_number_type,
      credit_limit, opening_balance, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.customer_code,
      data.name,
      data.company_name ?? null,
      data.phone_1 ?? null,
      data.phone_2 ?? null,
      data.email ?? null,
      data.address_line_1 ?? null,
      data.address_line_2 ?? null,
      data.city ?? null,
      data.state ?? null,
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
}


export async function getCustomerById(id: string) {
  const [rows] = await db.execute(
    'SELECT * FROM customers WHERE id = ?',
    [id]
  );

  return (rows as any[])[0] || null;
}

export async function updateCustomer(id: string, data: any) {
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
      zipcode = ?,
      country = ?,
      tax_number = ?,
      tax_number_type = ?,
      credit_limit = ?,
      opening_balance = ?,
      status = ?
    WHERE id = ?`,
    [
      data.customer_code,
      data.name,
      data.company_name || null,
      data.phone_1 || null,
      data.phone_2 || null,
      data.email || null,
      data.address_line_1 || null,
      data.address_line_2 || null,
      data.city || null,
      data.state || null,
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
