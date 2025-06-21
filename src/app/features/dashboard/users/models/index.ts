export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Alternative to firstName/lastName
  email: string;
  password?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  token?: string;
  access_token?: string; // Alternative token field
  role: 'user' | 'admin' | string;
  [key: string]: any; // Allow additional properties
}

export interface LoginResponse {
  user?: User;
  token?: string;
  access_token?: string;
  message?: string;
  [key: string]: any; // Allow additional properties
}
