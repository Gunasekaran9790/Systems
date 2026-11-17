import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface Company {
  id?: number;
  company_name: string;
  trade_name?: string | null;
  gstin?: string | null;
  pan?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  state_code?: string | null;
  pincode?: string | null;
  country?: string | null;
  logo_path?: string | null;
  bank_name?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  authorised_signatory?: string | null;
  invoice_footer?: string | null;
}

export const getCompanyModel = async (): Promise<Company | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM company ORDER BY id ASC LIMIT 1',
  );

  return rows.length ? (rows[0] as Company) : null;
};

export const saveCompanyModel = async (
  data: Company,
): Promise<Company> => {
  const existing = await getCompanyModel();

  const fields = [
    'company_name',
    'trade_name',
    'gstin',
    'pan',
    'email',
    'phone',
    'website',
    'address_line1',
    'address_line2',
    'city',
    'state',
    'state_code',
    'pincode',
    'country',
    'logo_path',
    'bank_name',
    'bank_account_name',
    'bank_account_number',
    'bank_ifsc',
    'authorised_signatory',
    'invoice_footer',
  ] as const;

  const values = fields.map((field) => {
    if (field === 'logo_path') {
      return data.logo_path ?? existing?.logo_path ?? null;
    }

    if (field === 'country') {
      return data.country || 'India';
    }

    return data[field] ?? null;
  });

  if (existing?.id) {
    const setClause = fields
      .map((field) => `${field} = ?`)
      .join(', ');

    await pool.execute<ResultSetHeader>(
      `UPDATE company SET ${setClause} WHERE id = ?`,
      [...values, existing.id],
    );
  } else {
    const placeholders = fields.map(() => '?').join(', ');

    await pool.execute<ResultSetHeader>(
      `INSERT INTO company (${fields.join(', ')}) VALUES (${placeholders})`,
      values,
    );
  }

  const saved = await getCompanyModel();

  if (!saved) {
    throw new Error('Unable to retrieve saved company details.');
  }

  return saved;
};