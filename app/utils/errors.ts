// Error handling utilities

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorMessages = {
  // Network errors
  NETWORK_ERROR: 'Network connection failed. Please try again.',
  TIMEOUT_ERROR: 'Request timed out. Please check your connection.',
  NO_INTERNET: 'No internet connection. Please check your network.',

  // API errors
  API_ERROR: 'An error occurred while fetching data.',
  INVALID_API_RESPONSE: 'Invalid response from server.',
  API_RATE_LIMITED: 'Too many requests. Please try again later.',

  // Authentication errors
  AUTH_FAILED: 'Authentication failed. Please login again.',
  INVALID_TOKEN: 'Your session has expired. Please login again.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',

  // Validation errors
  INVALID_INPUT: 'Please check your input and try again.',
  INVALID_AMOUNT: 'Invalid amount. Please enter a valid number.',
  INVALID_ADDRESS: 'Invalid wallet address.',

  // Transaction errors
  INSUFFICIENT_BALANCE: 'Insufficient balance to complete transaction.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  TRANSACTION_PENDING: 'Transaction is still pending. Please wait.',

  // Portfolio errors
  PORTFOLIO_ERROR: 'Error loading portfolio. Please try again.',
  HOLDING_NOT_FOUND: 'Cryptocurrency holding not found.',

  // General errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  NOT_FOUND: 'The requested item was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

export const handleError = (error: any): AppError => {
  // If already an AppError, return as-is
  if (error instanceof AppError) {
    return error;
  }

  // Handle network errors
  if (error?.message === 'Network request failed') {
    return new AppError('NETWORK_ERROR', errorMessages.NETWORK_ERROR, 0);
  }

  if (error?.message === 'The network request timed out') {
    return new AppError('TIMEOUT_ERROR', errorMessages.TIMEOUT_ERROR, 0);
  }

  // Handle fetch errors
  if (error?.message?.includes('Network')) {
    return new AppError('NO_INTERNET', errorMessages.NO_INTERNET, 0);
  }

  // Handle HTTP errors
  if (error?.status) {
    const status = error.status;
    
    if (status === 401) {
      return new AppError('AUTH_FAILED', errorMessages.AUTH_FAILED, 401);
    }
    
    if (status === 403) {
      return new AppError('UNAUTHORIZED', errorMessages.UNAUTHORIZED, 403);
    }
    
    if (status === 404) {
      return new AppError('NOT_FOUND', errorMessages.NOT_FOUND, 404);
    }
    
    if (status === 429) {
      return new AppError('API_RATE_LIMITED', errorMessages.API_RATE_LIMITED, 429);
    }
    
    if (status >= 500) {
      return new AppError('SERVER_ERROR', errorMessages.SERVER_ERROR, status);
    }
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError) {
    return new AppError('INVALID_API_RESPONSE', errorMessages.INVALID_API_RESPONSE, 500);
  }

  // Default unknown error
  return new AppError('UNKNOWN_ERROR', errorMessages.UNKNOWN_ERROR, 500);
};

export const getErrorMessage = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  return errorMessages.UNKNOWN_ERROR;
};

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super('VALIDATION_ERROR', message, 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = errorMessages.NETWORK_ERROR) {
    super('NETWORK_ERROR', message, 0);
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class AuthError extends AppError {
  constructor(message: string = errorMessages.AUTH_FAILED) {
    super('AUTH_ERROR', message, 401);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class TransactionError extends AppError {
  constructor(message: string = errorMessages.TRANSACTION_FAILED) {
    super('TRANSACTION_ERROR', message, 500);
    Object.setPrototypeOf(this, TransactionError.prototype);
  }
}
