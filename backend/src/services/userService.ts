import { PrismaClient, User, UserRole } from '../generated/prisma';
import { UserWithoutPassword, userSelectWithoutPassword } from '../types/user';

const prisma = new PrismaClient();

// ========================================
// User Service - All database operations
// ========================================

export const userService = {
  /**
   * Get all users (without passwords)
   */
  async findAll(): Promise<UserWithoutPassword[]> {
    return await prisma.user.findMany({
      select: userSelectWithoutPassword
    });
  },

  /**
   * Get user by ID (without password)
   */
  async findById(id: string): Promise<UserWithoutPassword | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: userSelectWithoutPassword
    });
  },

  /**
   * Get user by email (with password - for authentication)
   * This is the only method that returns the full User with password
   */
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  /**
   * Get user by student ID (without password)
   */
  async findByStudentId(studentId: string): Promise<UserWithoutPassword | null> {
    return await prisma.user.findUnique({
      where: { studentId },
      select: userSelectWithoutPassword
    });
  },

  /**
   * Create new user (returns without password)
   */
  async create(data: {
    studentId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<UserWithoutPassword> {
    return await prisma.user.create({
      data: {
        studentId: data.studentId,
        email: data.email,
        password: data.password, // TODO: Hash before passing to service!
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'STUDENT'
      },
      select: userSelectWithoutPassword
    });
  },

  /**
   * Update user (returns without password)
   */
  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
    }
  ): Promise<UserWithoutPassword> {
    return await prisma.user.update({
      where: { id },
      data,
      select: userSelectWithoutPassword
    });
  },

  /**
   * Delete user (returns without password)
   */
  async delete(id: string): Promise<UserWithoutPassword> {
    return await prisma.user.delete({
      where: { id },
      select: userSelectWithoutPassword
    });
  },

  /**
   * Count users by role
   */
  async countByRole(role: UserRole): Promise<number> {
    return await prisma.user.count({
      where: { role }
    });
  },

  /**
   * Search users by name or email (without passwords)
   */
  async search(query: string): Promise<UserWithoutPassword[]> {
    return await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: userSelectWithoutPassword
    });
  }
};