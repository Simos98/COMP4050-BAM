import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { sendError } from '../utils/apiResponses';

// Request type including user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

// Middleware to verify JWT token and attach user to request
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      token = (req as any).cookies?.token;
    }

    if (!token) {
      sendError(res, 'No token provided', 401);
      return;
    }

    const decoded = authService.verifyToken(token);

    if (!decoded) {
      sendError(res, 'Invalid or expired token', 401);
      return;
    }

    (req as AuthRequest).user = {
      id: (decoded as any).id,
      email: (decoded as any).email,
      role: (decoded as any).role
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    sendError(res, 'Authentication failed', 401);
  }
};