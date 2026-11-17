import { ResultSetHeader, RowDataPacket } from 'mysql2';
import Decimal from 'decimal.js';
import db from '../config/db';

type GSTRates = {
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
};

type ItemInput = {
  product_id: number | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_amount: number;
};

type QuotationInput = {
  customer_id: number;
  quotation_date: string;
  valid_until?: string | null;
  notes?: string;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  items: ItemInput[];
};

interface QuotationRow extends RowDataPacket {
  id: number;
  quotation_no: string;
  customer_id: number;
  quotation_date: string;
  total_amount: number;
  status: string;
}

const money = (value: Decimal.Value) =>
  new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

const GST_RATE_LIMIT = 100;

export class QuotationModel {
  static async getAll() {
    const [rows] = await db.execute<RowDataPacket[]>(`
      SELECT
        q.*,
        c.customer_code,
        c.name AS customer_name
      FROM quotations q
      INNER JOIN customers c ON c.id = q.customer_id
      ORDER BY q.id DESC
    `);

    return rows;
  }

  static async getById(id: number) {
    const [rows] = await db.execute<QuotationRow[]>(
      `SELECT
         q.*,
         c.customer_code,
         c.name AS customer_name,
         c.company_name,
         c.email AS customer_email,
         c.phone_1 AS customer_phone,
         c.address_line_1,
         c.address_line_2,
         c.city AS customer_city,
         c.state AS customer_state,
         c.state_code AS customer_state_code,
         c.zipcode AS customer_zipcode,
         c.country AS customer_country
       FROM quotations q
       INNER JOIN customers c ON c.id = q.customer_id
       WHERE q.id = ?`,
      [id],
    );

    if (!rows.length) return null;

    const [items] = await db.execute<RowDataPacket[]>(
      `SELECT
         qi.*,
         p.sku,
         p.name AS product_name
       FROM quotation_items qi
       LEFT JOIN products p ON p.id = qi.product_id
       WHERE qi.quotation_id = ?
       ORDER BY qi.id`,
      [id],
    );

    return { ...rows[0], items };
  }

  static async searchCustomers(search: string) {
    const term = `%${search.trim()}%`;

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, customer_code, name, company_name, state, state_code
       FROM customers
       WHERE status = 'ACTIVE'
         AND (
           name LIKE ?
           OR customer_code LIKE ?
           OR company_name LIKE ?
         )
       ORDER BY name
       LIMIT 20`,
      [term, term, term],
    );

    return rows;
  }

  static async searchProducts(search: string) {
    const term = `%${search.trim()}%`;

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, sku, name, description, unit, selling_price
       FROM products
       WHERE status = 'ACTIVE'
         AND (name LIKE ? OR sku LIKE ?)
       ORDER BY name
       LIMIT 30`,
      [term, term],
    );

    return rows;
  }

  static async create(input: QuotationInput, userId: number) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [customerRows] = await connection.execute<RowDataPacket[]>(
        `SELECT id, state, state_code
         FROM customers
         WHERE id = ? AND status = 'ACTIVE'
         FOR UPDATE`,
        [input.customer_id],
      );

      if (!customerRows.length) {
        throw new Error('Customer not found or inactive');
      }

      const [companyRows] = await connection.execute<RowDataPacket[]>(
        `SELECT state, state_code
         FROM company
         ORDER BY id ASC
         LIMIT 1`,
      );

      if (!companyRows.length || !companyRows[0].state_code) {
        throw new Error('Please configure the company state code first');
      }

      const companyCode = String(companyRows[0].state_code).trim();
      const customerCode = String(customerRows[0].state_code ?? '').trim();

      if (!customerCode) {
        throw new Error('Please configure the selected customer state code');
      }

      const isSameState = companyCode === customerCode;

      this.validateGSTRates(input, isSameState);

      let subtotal = new Decimal(0);
      let discountTotal = new Decimal(0);
      const calculatedItems: Array<{
        product_id: number | null;
        description: string;
        quantity: Decimal;
        unit: string;
        unit_price: Decimal;
        discount_amount: Decimal;
        total_amount: Decimal;
      }> = [];

      for (const item of input.items) {
        if (item.product_id !== null) {
          const [productRows] = await connection.execute<RowDataPacket[]>(
            `SELECT id
             FROM products
             WHERE id = ? AND status = 'ACTIVE'`,
            [item.product_id],
          );

          if (!productRows.length) {
            throw new Error(`Product ID ${item.product_id} is not available`);
          }
        }

        const quantity = new Decimal(item.quantity);
        const unitPrice = money(item.unit_price);
        const gross = money(quantity.mul(unitPrice));
        const discount = money(item.discount_amount);

        if (discount.gt(gross)) {
          throw new Error(`Discount is greater than the amount for ${item.description}`);
        }

        const lineTotal = money(gross.minus(discount));

        subtotal = subtotal.plus(lineTotal);
        discountTotal = discountTotal.plus(discount);

        calculatedItems.push({
          product_id: item.product_id,
          description: item.description.trim(),
          quantity,
          unit: item.unit.trim(),
          unit_price: unitPrice,
          discount_amount: discount,
          total_amount: lineTotal,
        });
      }

      subtotal = money(subtotal);
      discountTotal = money(discountTotal);

      const cgstRate = new Decimal(input.cgst_rate);
      const sgstRate = new Decimal(input.sgst_rate);
      const igstRate = new Decimal(input.igst_rate);

      const cgstAmount = money(subtotal.mul(cgstRate).div(100));
      const sgstAmount = money(subtotal.mul(sgstRate).div(100));
      const igstAmount = money(subtotal.mul(igstRate).div(100));

      const taxAmount = money(
        cgstAmount.plus(sgstAmount).plus(igstAmount),
      );

      const totalAmount = money(subtotal.plus(taxAmount));

      // Lock the sequence row so concurrent requests cannot use the same number.
      const [sequenceRows] = await connection.execute<RowDataPacket[]>(
        `SELECT last_number
         FROM quotation_sequences
         WHERE id = 1
         FOR UPDATE`,
      );

      if (!sequenceRows.length) {
        throw new Error('Quotation number sequence is not configured');
      }

      const nextNumber = Number(sequenceRows[0].last_number) + 1;

      await connection.execute(
        `UPDATE quotation_sequences
         SET last_number = ?
         WHERE id = 1`,
        [nextNumber],
      );

      const quotationNo = `QT-${String(nextNumber).padStart(5, '0')}`;

      const [insertResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO quotations (
          quotation_no,
          customer_id,
          quotation_date,
          valid_until,
          subtotal,
          discount_amount,
          cgst_rate,
          sgst_rate,
          igst_rate,
          cgst_amount,
          sgst_amount,
          igst_amount,
          tax_amount,
          total_amount,
          status,
          notes,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)`,
        [
          quotationNo,
          input.customer_id,
          input.quotation_date,
          input.valid_until || null,
          subtotal.toFixed(2),
          discountTotal.toFixed(2),
          isSameState ? cgstRate.toFixed(2) : '0.00',
          isSameState ? sgstRate.toFixed(2) : '0.00',
          isSameState ? '0.00' : igstRate.toFixed(2),
          cgstAmount.toFixed(2),
          sgstAmount.toFixed(2),
          igstAmount.toFixed(2),
          taxAmount.toFixed(2),
          totalAmount.toFixed(2),
          input.notes || null,
          userId,
        ],
      );

      const quotationId = insertResult.insertId;

      for (const item of calculatedItems) {
        await connection.execute(
          `INSERT INTO quotation_items (
            quotation_id,
            product_id,
            description,
            quantity,
            unit,
            unit_price,
            discount_amount,
            tax_rate,
            tax_amount,
            total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
          [
            quotationId,
            item.product_id,
            item.description,
            item.quantity.toFixed(3),
            item.unit,
            item.unit_price.toFixed(2),
            item.discount_amount.toFixed(2),
            item.total_amount.toFixed(2),
          ],
        );
      }

      await connection.commit();

      return {
        id: quotationId,
        quotation_no: quotationNo,
        subtotal: subtotal.toFixed(2),
        discount_amount: discountTotal.toFixed(2),
        cgst_amount: cgstAmount.toFixed(2),
        sgst_amount: sgstAmount.toFixed(2),
        igst_amount: igstAmount.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }


  //Quotation update only for DRAFT status
  
static async update(id: number, input: QuotationInput) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Check quotation exists and lock it.
    const [quotationRows] = await connection.execute<RowDataPacket[]>(
      `SELECT id, quotation_no, status
       FROM quotations
       WHERE id = ?
       FOR UPDATE`,
      [id],
    );

    if (!quotationRows.length) {
      throw new Error('Quotation not found');
    }

    if (quotationRows[0].status !== 'DRAFT') {
      throw new Error('Only draft quotations can be edited');
    }

    // 2. Check selected customer.
    const [customerRows] = await connection.execute<RowDataPacket[]>(
      `SELECT id, state, state_code
       FROM customers
       WHERE id = ? AND status = 'ACTIVE'
       FOR UPDATE`,
      [input.customer_id],
    );

    if (!customerRows.length) {
      throw new Error('Customer not found or inactive');
    }

    // 3. Load company state code.
    const [companyRows] = await connection.execute<RowDataPacket[]>(
      `SELECT state, state_code
       FROM company
       ORDER BY id ASC
       LIMIT 1`,
    );

    if (!companyRows.length || !companyRows[0].state_code) {
      throw new Error('Please configure the company state code first');
    }

    const companyCode = String(companyRows[0].state_code).trim();
    const customerCode = String(
      customerRows[0].state_code ?? '',
    ).trim();

    if (!customerCode) {
      throw new Error(
        'Please configure the selected customer state code',
      );
    }

    const isSameState = companyCode === customerCode;

    // 4. Validate GST rates.
    this.validateGSTRates(input, isSameState);

    // 5. Calculate item amounts.
    if (!input.items || input.items.length === 0) {
      throw new Error('At least one quotation item is required');
    }

    let subtotal = new Decimal(0);
    let discountTotal = new Decimal(0);

    const calculatedItems: Array<{
      product_id: number | null;
      description: string;
      quantity: Decimal;
      unit: string;
      unit_price: Decimal;
      discount_amount: Decimal;
      total_amount: Decimal;
    }> = [];

    for (const item of input.items) {
      if (item.product_id !== null) {
        const [productRows] =
          await connection.execute<RowDataPacket[]>(
            `SELECT id
             FROM products
             WHERE id = ? AND status = 'ACTIVE'`,
            [item.product_id],
          );

        if (!productRows.length) {
          throw new Error(
            `Product ID ${item.product_id} is not available`,
          );
        }
      }

      const quantity = new Decimal(item.quantity);
      const unitPrice = money(item.unit_price);
      const gross = money(quantity.mul(unitPrice));
      const discount = money(item.discount_amount);

      if (quantity.lte(0)) {
        throw new Error(
          `Quantity must be greater than zero for ${item.description}`,
        );
      }

      if (unitPrice.lt(0) || discount.lt(0)) {
        throw new Error(
          `Price and discount cannot be negative for ${item.description}`,
        );
      }

      if (discount.gt(gross)) {
        throw new Error(
          `Discount is greater than the amount for ${item.description}`,
        );
      }

      const lineTotal = money(gross.minus(discount));

      subtotal = subtotal.plus(lineTotal);
      discountTotal = discountTotal.plus(discount);

      calculatedItems.push({
        product_id: item.product_id,
        description: item.description.trim(),
        quantity,
        unit: item.unit.trim(),
        unit_price: unitPrice,
        discount_amount: discount,
        total_amount: lineTotal,
      });
    }

    subtotal = money(subtotal);
    discountTotal = money(discountTotal);

    // 6. Calculate GST.
    const cgstRate = new Decimal(input.cgst_rate);
    const sgstRate = new Decimal(input.sgst_rate);
    const igstRate = new Decimal(input.igst_rate);

    const savedCgstRate = isSameState
      ? cgstRate
      : new Decimal(0);

    const savedSgstRate = isSameState
      ? sgstRate
      : new Decimal(0);

    const savedIgstRate = isSameState
      ? new Decimal(0)
      : igstRate;

    const cgstAmount = money(
      subtotal.mul(savedCgstRate).div(100),
    );

    const sgstAmount = money(
      subtotal.mul(savedSgstRate).div(100),
    );

    const igstAmount = money(
      subtotal.mul(savedIgstRate).div(100),
    );

    const taxAmount = money(
      cgstAmount.plus(sgstAmount).plus(igstAmount),
    );

    const totalAmount = money(subtotal.plus(taxAmount));

    // 7. Update existing quotation header.
    // quotation_no and created_by are intentionally preserved.
    await connection.execute(
      `UPDATE quotations SET
        customer_id = ?,
        quotation_date = ?,
        valid_until = ?,
        subtotal = ?,
        discount_amount = ?,
        cgst_rate = ?,
        sgst_rate = ?,
        igst_rate = ?,
        cgst_amount = ?,
        sgst_amount = ?,
        igst_amount = ?,
        tax_amount = ?,
        total_amount = ?,
        notes = ?
       WHERE id = ?`,
      [
        input.customer_id,
        input.quotation_date,
        input.valid_until || null,
        subtotal.toFixed(2),
        discountTotal.toFixed(2),
        savedCgstRate.toFixed(2),
        savedSgstRate.toFixed(2),
        savedIgstRate.toFixed(2),
        cgstAmount.toFixed(2),
        sgstAmount.toFixed(2),
        igstAmount.toFixed(2),
        taxAmount.toFixed(2),
        totalAmount.toFixed(2),
        input.notes || null,
        id,
      ],
    );

    // 8. Replace existing quotation items.
    await connection.execute(
      'DELETE FROM quotation_items WHERE quotation_id = ?',
      [id],
    );

    for (const item of calculatedItems) {
      await connection.execute(
        `INSERT INTO quotation_items (
          quotation_id,
          product_id,
          description,
          quantity,
          unit,
          unit_price,
          discount_amount,
          tax_rate,
          tax_amount,
          total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
        [
          id,
          item.product_id,
          item.description,
          item.quantity.toFixed(3),
          item.unit,
          item.unit_price.toFixed(2),
          item.discount_amount.toFixed(2),
          item.total_amount.toFixed(2),
        ],
      );
    }

    await connection.commit();

    // Return the updated quotation with customer and item details.
    const updatedQuotation = await this.getById(id);

    if (!updatedQuotation) {
      throw new Error('Unable to retrieve updated quotation');
    }

    return updatedQuotation;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}


  private static validateGSTRates(
    input: QuotationInput,
    isSameState: boolean,
  ) {
    const rates = [
      input.cgst_rate,
      input.sgst_rate,
      input.igst_rate,
    ];

    if (rates.some((rate) =>
      !Number.isFinite(rate) || rate < 0 || rate > GST_RATE_LIMIT
    )) {
      throw new Error('GST rates must be between 0 and 100');
    }

    if (isSameState) {
      if (input.igst_rate !== 0) {
        throw new Error('IGST must be zero for same-state transactions');
      }
    } else {
      if (input.cgst_rate !== 0 || input.sgst_rate !== 0) {
        throw new Error('CGST and SGST must be zero for different-state transactions');
      }
    }
  }

  static async updateStatus(id: number, status: string) {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT status FROM quotations WHERE id = ?',
      [id],
    );

    if (!rows.length) {
      throw new Error('Quotation not found');
    }

    const current = rows[0].status as string;

    const allowed: Record<string, string[]> = {
      DRAFT: ['SENT', 'CANCELLED'],
      SENT: ['ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
      ACCEPTED: [],
      REJECTED: [],
      EXPIRED: [],
      CANCELLED: [],
    };

    if (!allowed[current]?.includes(status)) {
      throw new Error(`Cannot change quotation status from ${current} to ${status}`);
    }

    await db.execute(
      'UPDATE quotations SET status = ? WHERE id = ?',
      [status, id],
    );

    return true;
  }

  static async delete(id: number) {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT status FROM quotations WHERE id = ?',
      [id],
    );

    if (!rows.length) throw new Error('Quotation not found');

    if (rows[0].status !== 'DRAFT') {
      throw new Error('Only draft quotations can be deleted');
    }

    await db.execute('DELETE FROM quotations WHERE id = ?', [id]);
    return true;
  }
}