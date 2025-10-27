import { Request, Response, NextFunction } from 'express';
import { authService } from '@services/authService';
import { sendError } from '@utils/apiResponses';

// Extend Request type to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'No token provided', 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      sendError(res, 'Invalid or expired token', 401);
      return;
    }

    // Attach user to request
    (req as AuthRequest).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    sendError(res, 'Authentication failed', 401);
  }
};