import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '../generated/prisma';
import { UserWithoutPassword } from '../types/user';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const authService = {
  // Hash a password using bcrypt
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  // Compare password with hashed password
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  },

  // Generate JWT token
  generateToken(user: UserWithoutPassword): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      } as jwt.SignOptions);
  },

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  // Authenticate user with email and password
  async login(email: string, password: string): Promise<{
    user: UserWithoutPassword;
    token: string;
  } | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const userWithoutPassword: UserWithoutPassword = {
      id: user.id,
      studentId: user.studentId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const token = this.generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token
    };
  },

  // Register new user
  async register(data: {
    studentId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: UserWithoutPassword; token: string }> {
    const hashedPassword = await this.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        studentId: data.studentId,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'STUDENT'
      },
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

    const token = this.generateToken(user);

    return { user, token };
  }
};