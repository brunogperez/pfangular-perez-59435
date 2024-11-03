export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  token: string;
  role: 'user' | 'admin';
}
