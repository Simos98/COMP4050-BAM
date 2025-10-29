import { Request, Response, NextFunction } from 'express';

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const role = (user.role ?? '').toString().toUpperCase();
  if (role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Admin role required' });
    return;
  }
  next();
};