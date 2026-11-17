
import puppeteer from 'puppeteer';
import type { RowDataPacket } from 'mysql2';
import db from '../config/db';

import fs from 'node:fs/promises';
import path from 'node:path';

interface CompanyRow extends RowDataPacket {
  company_name: string | null;
  trade_name: string | null;
  gstin: string | null;
  pan: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  state_code: string | null;
  pincode: string | null;
  country: string | null;
  logo_path: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  authorised_signatory: string | null;
  invoice_footer: string | null;
}

export class QuotationPDFService {

  // Escape HTML to prevent HTML injection.
  private static escapeHTML(value: unknown): string {
    return String(value ?? '').replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entities[char];
    });
  }

  // Format money.
  private static money(value: unknown): string {
    return Number(value || 0).toFixed(2);
  }

  // Load company logo from public/uploads.
  private static async getLogoHTML(
    logoPath: string | null,
  ): Promise<string> {

    if (!logoPath) {
      return '';
    }

    const normalizedPath = logoPath.replace(/\\/g, '/');

    // Accept paths such as:
    // /uploads/company.png
    // uploads/company.png
    // company.png
    // /public/uploads/company.png

    let relativePath = normalizedPath.replace(/^\/+/, '');

    if (relativePath.startsWith('public/uploads/company/')) {
        relativePath = relativePath.slice('public/uploads/company/'.length);
    } else if (relativePath.startsWith('uploads/company/')) {
        relativePath = relativePath.slice('uploads/company/'.length);
    } else if (relativePath.startsWith('company/')) {
        relativePath = relativePath.slice('company/'.length);
    }

    const uploadDirectory = path.resolve(
      process.cwd(),
      'public',
      'uploads',
      'company',
    );

    const absoluteLogoPath = path.resolve(
      uploadDirectory,
      relativePath,
    );

    // Prevent access outside public/uploads.
    if (
      absoluteLogoPath !== uploadDirectory &&
      !absoluteLogoPath.startsWith(uploadDirectory + path.sep)
    ) {
      console.warn('Invalid company logo path');
      return '';
    }

    const extension = path.extname(absoluteLogoPath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    };

    const mimeType = mimeTypes[extension];

    if (!mimeType) {
      console.warn('Unsupported company logo format');
      return '';
    }

    try {
      const logoBuffer = await fs.readFile(absoluteLogoPath);

      const base64 = logoBuffer.toString('base64');

      return `
        <img
          src="data:${mimeType};base64,${base64}"
          alt="Company Logo"
        />
      `;

    } catch (error) {
      console.warn('Unable to load company logo:', error);
      return '';
    }
  }

  static async generate(quotation: object): Promise<Buffer> {

    const q = quotation as Record<string, any>;

    // 1. Get company details.
    const [companyRows] = await db.execute<CompanyRow[]>(
      'SELECT * FROM company LIMIT 1',
    );

    const company = companyRows[0];

    if (!company) {
      throw new Error('Company details not found');
    }

    // 2. Load templates from compiled src/templates.
    const templateDirectory = path.join(
      process.cwd(),
      'src',
      'templates',
    );

    let html = await fs.readFile(
      path.join(templateDirectory, 'quotation.html'),
      'utf8',
    );

    const css = await fs.readFile(
      path.join(templateDirectory, 'quotation.css'),
      'utf8',
    );

    // 3. Company address.
    const companyAddress = [
      company.address_line1,
      company.address_line2,
      company.city,
      company.state,
      company.pincode,
      company.country,
    ]
      .filter(Boolean)
      .join(', ');

    // 4. Company contact.
    const companyContact = [
      company.phone && `Phone: ${company.phone}`,
      company.email && `Email: ${company.email}`,
      company.gstin && `GSTIN: ${company.gstin}`,
      company.pan && `PAN: ${company.pan}`,
    ]
      .filter(Boolean)
      .join(' | ');

    // 5. Logo.
    const logoHTML = await this.getLogoHTML(company.logo_path);

    // 6. Quotation items.
    const items = Array.isArray(q.items) ? q.items : [];

    const itemRows = items
      .map((item: Record<string, any>) => {

        const quantity = Number(item.quantity || 0);
        const price = Number(item.unit_price || 0);
        const discount = Number(item.discount_amount || 0);

        const amount =
          item.line_total !== undefined
            ? Number(item.line_total)
            : item.total_amount !== undefined
              ? Number(item.total_amount)
              : quantity * price - discount;

        return `
          <tr>
            <td>${this.escapeHTML(item.description || '-')}</td>
            <td>${this.escapeHTML(quantity)}</td>
            <td>${this.escapeHTML(item.unit || '-')}</td>
            <td>${this.money(price)}</td>
            <td>${this.money(discount)}</td>
            <td>${this.money(amount)}</td>
          </tr>
        `;

      })
      .join('');

    // 7. Totals.
    const totalRows: string[] = [];

    const addTotal = (
      label: string,
      value: unknown,
      bold = false,
    ) => {

      totalRows.push(`
        <div class="total-row ${bold ? 'grand-total' : ''}">
          <span>${this.escapeHTML(label)}</span>
          <strong>${this.money(value)}</strong>
        </div>
      `);

    };

    addTotal('Subtotal', q.subtotal);
    addTotal('Discount', q.discount_amount);

    if (Number(q.cgst_rate || 0) > 0) {
      addTotal(
        `CGST (${this.money(q.cgst_rate)}%)`,
        q.cgst_amount,
      );
    }

    if (Number(q.sgst_rate || 0) > 0) {
      addTotal(
        `SGST (${this.money(q.sgst_rate)}%)`,
        q.sgst_amount,
      );
    }

    if (Number(q.igst_rate || 0) > 0) {
      addTotal(
        `IGST (${this.money(q.igst_rate)}%)`,
        q.igst_amount,
      );
    }

    addTotal('GRAND TOTAL', q.total_amount, true);

    // 8. Bank details.
    const bankDetails = [
      company.bank_name && `Bank: ${company.bank_name}`,
      company.bank_account_name &&
        `Account Name: ${company.bank_account_name}`,
      company.bank_account_number &&
        `Account No: ${company.bank_account_number}`,
      company.bank_ifsc &&
        `IFSC: ${company.bank_ifsc}`,
    ]
      .filter(Boolean)
      .join(' | ');

    // 9. Replace HTML placeholders.
    const replacements: Record<string, string> = {

      LOGO: logoHTML,

      COMPANY_NAME: this.escapeHTML(
        company.trade_name ||
        company.company_name ||
        'Company',
      ),

      COMPANY_ADDRESS: this.escapeHTML(companyAddress),

      COMPANY_CONTACT: this.escapeHTML(companyContact),

      COMPANY_WEBSITE: this.escapeHTML(company.website || ''),

      QUOTATION_NO: this.escapeHTML(q.quotation_no || '-'),

      QUOTATION_DATE: this.escapeHTML(
        String(q.quotation_date || '').slice(0, 10),
      ),

      VALID_UNTIL: this.escapeHTML(
        q.valid_until
          ? String(q.valid_until).slice(0, 10)
          : '-',
      ),

      CUSTOMER_NAME: this.escapeHTML(q.customer_name || '-'),

      CUSTOMER_CODE: this.escapeHTML(q.customer_code || '-'),

      CUSTOMER_STATE: this.escapeHTML(q.customer_state || '-'),

      CUSTOMER_STATE_CODE: this.escapeHTML(
        q.customer_state_code || '-',
      ),

      ITEM_ROWS: itemRows ||
        '<tr><td colspan="6">No items</td></tr>',

      TOTAL_ROWS: totalRows.join(''),

      NOTES: this.escapeHTML(q.notes || '-'),

      BANK_DETAILS: this.escapeHTML(bankDetails || '-'),

      AUTHORISED_SIGNATORY: this.escapeHTML(
        company.authorised_signatory || '',
      ),

      FOOTER: this.escapeHTML(company.invoice_footer || ''),
    };

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replaceAll(`{{${key}}}`, value);
    }

    // 10. Add CSS to HTML.
    html = html.replace(
      '</head>',
      `<style>${css}</style></head>`,
    );

    // 11. Generate PDF using Puppeteer.
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    try {

      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'load',
      });

      await page.emulateMediaType('print');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdf);

    } finally {
      await browser.close();
    }
  }
}
