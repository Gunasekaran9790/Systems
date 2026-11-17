
import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';

const maxLengths: Record<string, number> = {
  company_name: 255,
  trade_name: 255,
  gstin: 15,
  pan: 10,
  email: 150,
  phone: 20,
  website: 255,
  address_line1: 255,
  address_line2: 255,
  city: 100,
  state: 100,
  state_code: 2,
  pincode: 10,
  country: 100,
  bank_name: 150,
  bank_account_name: 255,
  bank_account_number: 50,
  bank_ifsc: 11,
  authorised_signatory: 255,
};

export const validateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = req.body;
  const errors: string[] = [];

  const value = (key: string): string =>
    typeof body[key] === 'string' ? body[key].trim() : '';

  // Required field
  if (!value('company_name')) {
    errors.push('Company name is required.');
  }

  // Maximum field lengths
  for (const [field, max] of Object.entries(maxLengths)) {
    if (value(field).length > max) {
      errors.push(
        `${field.replaceAll('_', ' ')} cannot exceed ${max} characters.`,
      );
    }
  }

  // Email validation
  const email = value('email');

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address.');
  }

  // GSTIN validation
  const gstin = value('gstin').toUpperCase();

  if (
    gstin &&
    !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)
  ) {
    errors.push('Please enter a valid GSTIN.');
  }

  // PAN validation
  const pan = value('pan').toUpperCase();

  if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    errors.push('Please enter a valid PAN number.');
  }

  // Pincode validation
  const pincode = value('pincode');

  if (pincode && !/^[0-9]{6}$/.test(pincode)) {
    errors.push('Pincode must contain exactly 6 digits.');
  }

  // State code validation
  const stateCode = value('state_code');

  if (stateCode && !/^[0-9]{2}$/.test(stateCode)) {
    errors.push('State code must contain exactly 2 digits.');
  }

  // IFSC validation
  const ifsc = value('bank_ifsc').toUpperCase();

  if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    errors.push('Please enter a valid IFSC code.');
  }

  // Remove uploaded logo if form validation fails
  if (errors.length > 0) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => undefined);
    }

    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  // Normalize values before saving
  body.company_name = value('company_name');
  body.gstin = gstin || null;
  body.pan = pan || null;
  body.bank_ifsc = ifsc || null;

  next();
};
