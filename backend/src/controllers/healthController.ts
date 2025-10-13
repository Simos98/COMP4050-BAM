import { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponses';
import { HealthCheckResponse } from '../types/index';

// Health check controller
export const getHealth = (req: Request, res: Response): void => {
  const healthData: HealthCheckResponse = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };

  sendSuccess(res, healthData, 'Server is healthy');
};

// Root endpoint controller
export const getRoot = (req: Request, res: Response): void => {
  const welcomeData = {
    message: 'COMP4050 Backend API is running!',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  };

  sendSuccess(res, welcomeData, 'Welcome to COMP4050 Backend API');
};
