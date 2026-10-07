export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN' | 'HR';
export interface User { id:string; email:string; firstName:string; lastName:string; role:UserRole; }
export interface AuthResponse { accessToken:string; expiresInSeconds:number; user:User; }