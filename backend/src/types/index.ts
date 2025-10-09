// Common response structure for all API endpoints
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Error structure
export interface ApiError {
  message: string;
  statusCode: number;
  stack?: string;
}

// Health check response
export interface HealthCheckResponse {
  status: string;
  uptime: number;
  timestamp: string;
  environment: string;
  version: string;
}

// Request with user info (we'll use this later for authentication)
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
