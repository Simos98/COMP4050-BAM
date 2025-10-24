import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@utils/apiResponses';
import { userService } from '@services/userService';

// ========================================
// User Controller - HTTP request handlers
// ========================================

/**
 * GET /api/users - Get all users
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.findAll();
    sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    console.error('Error fetching users:', error);
    sendError(res, 'Failed to fetch users', 500);
  }
};

/**
 * GET /api/users/:id - Get user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);
    
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    
    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Error fetching user:', error);
    sendError(res, 'Failed to fetch user', 500);
  }
};

/**
 * POST /api/users - Create new user
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, email, password, firstName, lastName, role } = req.body;
    
    // Validation
    if (!studentId || !email || !password || !firstName || !lastName) {
      sendError(res, 'Missing required fields', 400);
      return;
    }
    
    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      sendError(res, 'User with this email already exists', 400);
      return;
    }
    
    // Create user
    const newUser = await userService.create({
      studentId,
      email,
      password, // TODO: Hash password before creating!
      firstName,
      lastName,
      role
    });
    
    sendSuccess(res, newUser, 'User created successfully', 201);
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      sendError(res, 'User with this email or student ID already exists', 400);
    } else {
      sendError(res, 'Failed to create user', 500);
    }
  }
};

/**
 * PUT /api/users/:id - Update user
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role } = req.body;
    
    const updatedUser = await userService.update(id, {
      firstName,
      lastName,
      role
    });
    
    sendSuccess(res, updatedUser, 'User updated successfully');
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === 'P2025') {
      sendError(res, 'User not found', 404);
    } else {
      sendError(res, 'Failed to update user', 500);
    }
  }
};

/**
 * DELETE /api/users/:id - Delete user
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.delete(id);
    sendSuccess(res, null, 'User deleted successfully');
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    if (error.code === 'P2025') {
      sendError(res, 'User not found', 404);
    } else {
      sendError(res, 'Failed to delete user', 500);
    }
  }
};

/**
 * GET /api/users/search?q=query - Search users
 */
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      sendError(res, 'Search query is required', 400);
      return;
    }
    
    const users = await userService.search(query);
    sendSuccess(res, users, `Found ${users.length} users`);
  } catch (error) {
    console.error('Error searching users:', error);
    sendError(res, 'Failed to search users', 500);
  }
};