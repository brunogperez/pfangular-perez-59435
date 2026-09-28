import { Reseller } from './reseller.model';

export interface EndCustomer {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  reseller: string | Pick<Reseller, '_id' | 'firstName' | 'lastName' | 'businessName' | 'isOwner'>;
  active: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EndCustomerCreatePayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  reseller: string;
  notes?: string;
}

export interface EndCustomerUpdatePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  reseller?: string;
  active?: boolean;
  notes?: string;
}
