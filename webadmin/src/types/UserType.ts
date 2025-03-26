export interface AuthResponse {
  statusCode: number;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginCredentials {
  username: string;
  email: string;
  password: string;
}

// types/auth.types.ts
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TOKEN_ERROR = 'TOKEN_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  statusCode: number;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}