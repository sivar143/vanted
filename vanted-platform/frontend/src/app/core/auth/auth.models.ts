export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN' | 'HR';
}

export interface AuthResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: User;
}
