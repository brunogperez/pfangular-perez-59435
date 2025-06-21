export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthdate: Date;
  token?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
