import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { sendError } from '@utils/apiResponses';

// Middleware to check if user has required role
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN');

export const requireTeacherOrAdmin = requireRole('TEACHER', 'ADMIN');

