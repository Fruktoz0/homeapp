export interface User {
  id: string;
  email: string;
  displayName?: string;
  isVerified: boolean;
  timezone: string;
}

export interface AuthResponse {
  message: string;
  token: string;
}

export interface DecodedToken {
  id: string;
  email: string;
  displayName?: string;
  exp: number;
}