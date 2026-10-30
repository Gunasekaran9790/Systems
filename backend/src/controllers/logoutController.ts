import type { Request, Response, NextFunction, } from 'express'
import argon2 from 'argon2'
import * as LoginModel from '../models/loginModel'

export function logout(req: Request, res: Response) {
  req.session.destroy((error) => {
    if (error) {
      console.error('Logout error:', error);

      return res.status(500).json({
        message: 'Logout failed.',
      });
    }

    // Remove the session cookie from the browser.
    res.clearCookie('connect.sid');

    return res.status(200).json({
      message: 'Logout successful.',
    });
  });
}