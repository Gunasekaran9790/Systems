import type { Request, Response } from 'express';
import * as LoginModel from '../models/loginModel';

export async function getCurrentUser(
  req: Request,
  res: Response,
) {
  if (!req.session.userId) {
    return res.status(401).json({
      message: 'Please sign in.',
    });
  }

  try {
    const user = await LoginModel.findUserById(
      req.session.userId
    );

    if (!user) {
      return res.status(401).json({
        message: 'Please sign in.',
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('getCurrentUser error:', error);

    return res.status(500).json({
      message: 'Unable to load your account.',
    });
  }
}