import type { Request, Response, NextFunction, } from 'express'
import argon2 from 'argon2'
import * as LoginModel from '../models/loginModel'

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.body.email.trim().toLowerCase()
    const password = req.body.password

    const user = await LoginModel.findUserByEmail(email)

    // Use the same message for either type of login failure.
    if (
      !user ||
      !(await argon2.verify(user.password_hash, password))
    ) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    // Create a fresh session after successful authentication.
    req.session.regenerate((error) => {
        if (error) {
            //return next(error)
            return res.status(500).json({ message: "Session error" });
        }

      req.session.userId = user.id

      req.session.save((saveError) => {
        if (saveError) {
          return next(saveError)
        }

        return res.status(200).json({
          message: 'Login successful.',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
      })
    })
  } catch (error) {
    next(error)
  }
}