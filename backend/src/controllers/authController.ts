import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@utils/apiResponses';
import { authService } from '@services/authService';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '@middleware/authMiddleware';
const prisma = new PrismaClient();

// Simple in-memory rate limiting (for production, use Redis)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// ========================================
// Auth Controller - Authentication handlers
// ========================================

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate payload
    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    // Check rate limiting
    const clientKey = email.toLowerCase();
    const attempts = loginAttempts.get(clientKey);
    
    if (attempts) {
      if (Date.now() < attempts.resetAt) {
        if (attempts.count >= MAX_ATTEMPTS) {
          sendError(
            res,
            `Too many login attempts. Please try again in ${Math.ceil((attempts.resetAt - Date.now()) / 60000)} minutes`,
            429
          );
          return;
        }
      } else {
        // Reset if lockout period has passed
        loginAttempts.delete(clientKey);
      }
    }

    // Attempt login
    const result = await authService.login(email, password);

    // Invalid credentials
    if (!result) {
      // Increment failed attempts
      const current = loginAttempts.get(clientKey);
      if (current && Date.now() < current.resetAt) {
        current.count += 1;
      } else {
        loginAttempts.set(clientKey, {
          count: 1,
          resetAt: Date.now() + LOCKOUT_DURATION
        });
      }

      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Success - clear failed attempts
    loginAttempts.delete(clientKey);

    // Format response to match your spec
    const response = {
      user: {
        id: result.user.id,
        name: `${result.user.firstName} ${result.user.lastName}`,
        email: result.user.email,
        role: result.user.role.toLowerCase() // Convert ADMIN -> admin
      },
      token: result.token
    };

    sendSuccess(res, response, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'An error occurred during login', 500);
  }
};

/**
 * POST /api/auth/register
 * Register new user (optional)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, email, password, firstName, lastName } = req.body;

    // Validate payload
    if (!studentId || !email || !password || !firstName || !lastName) {
      sendError(res, 'All fields are required', 400);
      return;
    }

    // Register user
    const result = await authService.register({
      studentId,
      email,
      password,
      firstName,
      lastName
    });

    const response = {
      user: {
        id: result.user.id,
        name: `${result.user.firstName} ${result.user.lastName}`,
        email: result.user.email,
        role: result.user.role.toLowerCase()
      },
      token: result.token
    };

    sendSuccess(res, response, 'User registered successfully', 201);
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      sendError(res, 'User with this email or student ID already exists', 400);
    } else {
      sendError(res, 'An error occurred during registration', 500);
    }
  }
};

/**
 * GET /api/auth/me
 * Get current user from token (requires auth middleware)
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // This would be set by auth middleware
    const userId = (req as any).user?.id;

    if (!userId) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        studentId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const response = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role.toLowerCase()
    };

    sendSuccess(res, response, 'User retrieved successfully');
  } catch (error) {
    console.error('Get current user error:', error);
    sendError(res, 'An error occurred', 500);
  }
};

/**
 * POST /api/auth/logout
 * End the session (client-side token deletion)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  // With JWT, logout is handled client-side by removing the token
  // Server returns 204 No Content
  res.status(204).send();
};