import { User } from '@prisma/client';

// User type without password field - safe for API responses
export type UserWithoutPassword = Omit<User, 'password'>;

// Prisma select object to exclude password from queries
// Reusable across all user service methods
export const userSelectWithoutPassword = {
  id: true,
  studentId: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true
} as const;