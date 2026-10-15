import type { Request, Response, NextFunction } from 'express'
import argon2 from 'argon2'
import * as AuthModel from '../models/authModel'

export async function signup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const name = req.body.name.trim()
    const email = req.body.email.trim().toLowerCase()
    const password = req.body.password

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    })

    await AuthModel.createUser({
      name,
      email,
      passwordHash,
    })

    return res.status(201).json({
      message: 'Account created successfully',
    })
  } catch (error: unknown) {
    const dbError = error as {
      code?: string
      sqlMessage?: string
    }

    // Handle duplicate email
    if (
      dbError.code === 'ER_DUP_ENTRY' &&
      dbError.sqlMessage?.includes('users.email')
    ) {
      return res.status(409).json({
        message:
          'This email is already registered. Please use another email.',
      })
    }

    // Pass other errors to Express error middleware
    return next(error)
  }
}