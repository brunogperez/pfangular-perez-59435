export type UserRole = 'admin' | 'user' | 'reseller';

export interface User {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  /** Solo para role=reseller: id del Reseller vinculado (scope de datos). */
  resellerProfile?: string;
  password?: string;
  token?: string;
  refreshToken?: string;
  createdAt?: string;
}
