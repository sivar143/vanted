export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: User;
}
