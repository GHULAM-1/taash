import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '@/config';

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token ??
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string };

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authMiddleware;
