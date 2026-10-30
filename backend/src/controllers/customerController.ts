
import type { Request, Response } from 'express';
import * as CustomerModel from '../models/customerModel';

export async function getAllCustomers(
  req: Request,
  res: Response,
) {
  try {
    const customers = await CustomerModel.getAllCustomers();

    return res.status(200).json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);

    return res.status(500).json({
      message: 'Failed to load customers.',
    });
  }
}

export async function createCustomer(
  req: Request,
  res: Response,
) {
  try {
    const {
      customer_code,
      name,
      company_name,
      phone_1,
      phone_2,
      email,
      address_line_1,
      address_line_2,
      city,
      state,
      zipcode,
      country,
      tax_number,
      tax_number_type,
      credit_limit,
      opening_balance,
      status,
    } = req.body;

    if (
      typeof customer_code !== 'string' ||
      !customer_code.trim() ||
      typeof name !== 'string' ||
      !name.trim()
    ) {
      return res.status(400).json({
        message: 'Customer code and name are required.',
      });
    }

    await CustomerModel.createCustomer({
      customer_code: customer_code.trim(),
      name: name.trim(),
      company_name,
      phone_1,
      phone_2,
      email,
      address_line_1,
      address_line_2,
      city,
      state,
      zipcode,
      country,
      tax_number,
      tax_number_type,
      credit_limit,
      opening_balance,
      status,
    });

    return res.status(201).json({
      message: 'Customer created successfully.',
    });
  } catch (error) {
    console.error('Create customer error:', error);

    return res.status(500).json({
      message: 'Failed to create customer.',
    });
  }
}


export async function getCustomerById(
  req: Request,
  res: Response,
) {
  try {
    const customer = await CustomerModel.getCustomerById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found.',
      });
    }

    return res.status(200).json({ customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to load customer.',
    });
  }
}

export async function updateCustomer(
  req: Request,
  res: Response,
) {
  try {
    const existing = await CustomerModel.getCustomerById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: 'Customer not found.',
      });
    }

    const {
      customer_code,
      name,
      company_name,
      phone_1,
      phone_2,
      email,
      address_line_1,
      address_line_2,
      city,
      state,
      zipcode,
      country,
      tax_number,
      tax_number_type,
      credit_limit,
      opening_balance,
      status,
    } = req.body;

    if (
      typeof customer_code !== 'string' ||
      !customer_code.trim() ||
      typeof name !== 'string' ||
      !name.trim() ||
      !['ACTIVE', 'INACTIVE'].includes(status)
    ) {
      return res.status(400).json({
        message: 'Valid customer code, name and status are required.',
      });
    }

    await CustomerModel.updateCustomer(req.params.id, {
      customer_code: customer_code.trim(),
      name: name.trim(),
      company_name,
      phone_1,
      phone_2,
      email,
      address_line_1,
      address_line_2,
      city,
      state,
      zipcode,
      country,
      tax_number,
      tax_number_type,
      credit_limit: Number(credit_limit ?? 0),
      opening_balance: Number(opening_balance ?? 0),
      status,
    });

    return res.status(200).json({
      message: 'Customer updated successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to update customer.',
    });
  }
}

export async function updateCustomerStatus(
  req: Request,
  res: Response,
) {
  try {
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid customer status.',
      });
    }

    const existing = await CustomerModel.getCustomerById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: 'Customer not found.',
      });
    }

    await CustomerModel.updateCustomerStatus(
      req.params.id,
      status,
    );

    return res.status(200).json({
      message: 'Customer status updated successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to update customer status.',
    });
  }
}

export async function deleteCustomer(
  req: Request,
  res: Response,
) {
  try {
    const existing = await CustomerModel.getCustomerById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: 'Customer not found.',
      });
    }

    await CustomerModel.deleteCustomer(req.params.id);

    return res.status(200).json({
      message: 'Customer deleted successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to delete customer.',
    });
  }
}

