
import PDFDocument from 'pdfkit';
import type { RowDataPacket } from 'mysql2';
import db from '../config/db';

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
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  authorised_signatory: string | null;
  invoice_footer: string | null;
}

export class QuotationPDFService {
  static async generate(quotation: object): Promise<Buffer> {
    const q = quotation as Record<string, any>;

    // Get company details
    const [companyRows] = await db.execute<CompanyRow[]>(
      'SELECT * FROM company LIMIT 1',
    );

    const company = companyRows[0];

    if (!company) {
      throw new Error('Company details not found');
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 45,
          bufferPages: true,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const navy = '#17365D';
        const lightBlue = '#EAF0F7';
        const gray = '#666666';

        const money = (value: unknown) =>
          Number(value || 0).toFixed(2);

        const companyName =
          company.trade_name || company.company_name || 'Company';

        // Header
        doc.rect(0, 0, 595.28, 125).fill(navy);

        doc
          .fillColor('#FFFFFF')
          .fontSize(21)
          .font('Helvetica-Bold')
          .text(companyName, 45, 35, { width: 500 });

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

        doc
          .font('Helvetica')
          .fontSize(9)
          .text(companyAddress, 45, 68, { width: 500 });

        const contact = [
          company.phone && `Phone: ${company.phone}`,
          company.email && `Email: ${company.email}`,
          company.gstin && `GSTIN: ${company.gstin}`,
        ]
          .filter(Boolean)
          .join('   |   ');

        doc.text(contact, 45, 91, { width: 500 });

        // Document title
        doc
          .fillColor(navy)
          .font('Helvetica-Bold')
          .fontSize(22)
          .text('QUOTATION', 45, 145);

        doc
          .fontSize(10)
          .fillColor(gray)
          .font('Helvetica')
          .text(`Quotation No: ${q.quotation_no || '-'}`, 350, 150)
          .text(
            `Date: ${String(q.quotation_date || '').slice(0, 10)}`,
            350,
            166,
          )
          .text(
            `Valid Until: ${
              q.valid_until
                ? String(q.valid_until).slice(0, 10)
                : '-'
            }`,
            350,
            182,
          );

        // Customer details
        doc
          .roundedRect(45, 215, 505, 90, 5)
          .fill(lightBlue);

        doc
          .fillColor(navy)
          .font('Helvetica-Bold')
          .fontSize(11)
          .text('QUOTATION FOR', 58, 228);

        doc
          .fillColor('#222222')
          .font('Helvetica-Bold')
          .fontSize(11)
          .text(q.customer_name || '-', 58, 247);

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(gray);

        if (q.customer_code) {
          doc.text(`Customer Code: ${q.customer_code}`, 58, 265);
        }

        if (q.customer_state) {
          doc.text(`State: ${q.customer_state}`, 58, 279);
        }

        if (q.customer_state_code) {
          doc.text(`State Code: ${q.customer_state_code}`, 300, 279);
        }

        // Items table
        const tableTop = 330;
        const columns = {
          description: 45,
          qty: 300,
          unit: 345,
          price: 390,
          discount: 455,
          total: 510,
        };

        doc.rect(45, tableTop, 505, 27).fill(navy);

        doc
          .fillColor('#FFFFFF')
          .font('Helvetica-Bold')
          .fontSize(8);

        doc.text('Description', columns.description + 5, tableTop + 9);
        doc.text('Qty', columns.qty, tableTop + 9);
        doc.text('Unit', columns.unit, tableTop + 9);
        doc.text('Price', columns.price, tableTop + 9);
        doc.text('Discount', columns.discount - 5, tableTop + 9);
        doc.text('Amount', columns.total, tableTop + 9);

        let y = tableTop + 27;

        const items = Array.isArray(q.items) ? q.items : [];

        items.forEach((item: Record<string, any>, index: number) => {
          const description = String(item.description || '-');
          const descriptionHeight = doc.heightOfString(description, {
            width: 240,
            fontSize: 8,
          });

          const rowHeight = Math.max(25, descriptionHeight + 12);

          if (y + rowHeight > 700) {
            doc.addPage();
            y = 50;
          }

          if (index % 2 === 0) {
            doc.rect(45, y, 505, rowHeight).fill('#F5F7FA');
          }

          const quantity = Number(item.quantity || 0);
          const unitPrice = Number(item.unit_price || 0);
          const discount = Number(item.discount_amount || 0);

          const lineTotal =
            item.line_total !== undefined
              ? Number(item.line_total)
              : item.total_amount !== undefined
                ? Number(item.total_amount)
                : quantity * unitPrice - discount;

          doc
            .fillColor('#222222')
            .font('Helvetica')
            .fontSize(8);

          doc.text(description, 50, y + 7, {
            width: 240,
          });

          doc.text(String(quantity), columns.qty, y + 7);
          doc.text(String(item.unit || '-'), columns.unit, y + 7);
          doc.text(money(unitPrice), columns.price, y + 7);
          doc.text(money(discount), columns.discount - 5, y + 7);
          doc.text(money(lineTotal), columns.total, y + 7);

          y += rowHeight;

          doc
            .moveTo(45, y)
            .lineTo(550, y)
            .strokeColor('#DDDDDD')
            .stroke();
        });

        // Totals
        y += 22;

        if (y > 680) {
          doc.addPage();
          y = 50;
        }

        const totalsX = 365;

        const addTotal = (
          label: string,
          value: unknown,
          bold = false,
        ) => {
          doc
            .font(bold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(bold ? 11 : 9)
            .fillColor('#222222')
            .text(label, totalsX, y, { width: 115 });

          doc.text(money(value), 485, y, {
            width: 60,
            align: 'right',
          });

          y += bold ? 24 : 19;
        };

        addTotal('Subtotal', q.subtotal);
        addTotal('Discount', q.discount_amount);

        if (Number(q.cgst_rate || 0) > 0) {
          addTotal(
            `CGST (${money(q.cgst_rate)}%)`,
            q.cgst_amount,
          );
        }

        if (Number(q.sgst_rate || 0) > 0) {
          addTotal(
            `SGST (${money(q.sgst_rate)}%)`,
            q.sgst_amount,
          );
        }

        if (Number(q.igst_rate || 0) > 0) {
          addTotal(
            `IGST (${money(q.igst_rate)}%)`,
            q.igst_amount,
          );
        }

        doc
          .moveTo(totalsX, y)
          .lineTo(550, y)
          .lineWidth(1.5)
          .strokeColor(navy)
          .stroke();

        y += 10;

        addTotal('GRAND TOTAL', q.total_amount, true);

        // Notes
        if (q.notes) {
          y += 15;

          if (y > 680) {
            doc.addPage();
            y = 50;
          }

          doc
            .fillColor(navy)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('Notes', 45, y);

          y += 17;

          doc
            .fillColor('#333333')
            .font('Helvetica')
            .fontSize(9)
            .text(String(q.notes), 45, y, { width: 500 });
        }

        // Bank details
        y = Math.max(y + 35, 650);

        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        if (
          company.bank_name ||
          company.bank_account_number ||
          company.bank_ifsc
        ) {
          doc
            .fillColor(navy)
            .font('Helvetica-Bold')
            .fontSize(9)
            .text('BANK DETAILS', 45, y);

          y += 15;

          doc
            .fillColor(gray)
            .font('Helvetica')
            .fontSize(8);

          const bankDetails = [
            company.bank_name && `Bank: ${company.bank_name}`,
            company.bank_account_name &&
              `Account Name: ${company.bank_account_name}`,
            company.bank_account_number &&
              `Account No: ${company.bank_account_number}`,
            company.bank_ifsc && `IFSC: ${company.bank_ifsc}`,
          ]
            .filter(Boolean)
            .join('   |   ');

          doc.text(bankDetails, 45, y, { width: 500 });
          y += 25;
        }

        // Authorised signatory
        if (company.authorised_signatory) {
          doc
            .fillColor('#222222')
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(
              `For ${companyName}`,
              370,
              y,
              { width: 180, align: 'right' },
            );

          y += 35;

          doc
            .font('Helvetica')
            .fontSize(9)
            .text(company.authorised_signatory, 370, y, {
              width: 180,
              align: 'right',
            });

          doc
            .fontSize(8)
            .fillColor(gray)
            .text('Authorised Signatory', 370, y + 13, {
              width: 180,
              align: 'right',
            });
        }

        // Footer
        if (company.invoice_footer) {
          doc
            .fontSize(8)
            .fillColor(gray)
            .text(company.invoice_footer, 45, 770, {
              width: 505,
              align: 'center',
            });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
