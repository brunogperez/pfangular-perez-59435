export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string; 
  email: string;
  password?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  token?: string;
  access_token?: string; 
  role: 'user' | 'admin' | string;
  [key: string]: any; 
}

export interface LoginResponse {
  user?: User;
  token?: string;
  access_token?: string;
  message?: string;
  [key: string]: any; 
}
