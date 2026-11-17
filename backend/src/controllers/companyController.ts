import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import {
  getCompanyModel,
  saveCompanyModel,
  Company,
} from '../models/companyModel';

const removeUploadedFile = async (filePath?: string) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Unable to remove uploaded file:', error);
  }
};

export const getCompany = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const company = await getCompanyModel();

    return res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    next(error);
  }
};

export const saveCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const uploadedFile = req.file;

  try {
    const body = req.body;

    const companyData: Company = {
      company_name: body.company_name,
      trade_name: body.trade_name || null,
      gstin: body.gstin || null,
      pan: body.pan || null,
      email: body.email || null,
      phone: body.phone || null,
      website: body.website || null,
      address_line1: body.address_line1 || null,
      address_line2: body.address_line2 || null,
      city: body.city || null,
      state: body.state || null,
      state_code: body.state_code || null,
      pincode: body.pincode || null,
      country: body.country || 'India',
      logo_path: uploadedFile
        ? `/uploads/company/${uploadedFile.filename}`
        : undefined,
      bank_name: body.bank_name || null,
      bank_account_name: body.bank_account_name || null,
      bank_account_number: body.bank_account_number || null,
      bank_ifsc: body.bank_ifsc || null,
      authorised_signatory: body.authorised_signatory || null,
      invoice_footer: body.invoice_footer || null,
    };

    const oldCompany = await getCompanyModel();

    const savedCompany = await saveCompanyModel(companyData);

    // Remove the old logo only after the new company data is saved.
    if (
      uploadedFile &&
      oldCompany?.logo_path &&
      oldCompany.logo_path !== savedCompany.logo_path
    ) {
      const oldLogoPath = path.join(
        process.cwd(),
        'public',
        oldCompany.logo_path.replace(/^\/uploads\//, 'uploads/'),
      );

      await removeUploadedFile(oldLogoPath);
    }

    return res.status(200).json({
      success: true,
      message: 'Company details saved successfully.',
      company: savedCompany,
    });
  } catch (error) {
    // Do not leave an unused new logo behind if saving fails.
    await removeUploadedFile(uploadedFile?.path);
    next(error);
  }
};