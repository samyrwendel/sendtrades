export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  maxBots: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  theme?: 'light' | 'dark';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface AuthError {
  message: string;
  code: string;
} 