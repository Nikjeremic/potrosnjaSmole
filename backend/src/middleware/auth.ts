import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token je potreban' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Nevažeći token' });
    }
    // Map userId from token to _id for consistency
    req.user = {
      _id: decoded.userId,
      role: decoded.role
    };
    next();
  });
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user as any;
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Pristup odbijen. Potrebne su administratorske privilegije.' });
  }
  next();
};
