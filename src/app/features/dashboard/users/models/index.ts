export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  token: string;
  role: 'user' | 'admin';
}
