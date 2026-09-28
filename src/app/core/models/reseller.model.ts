export interface Reseller {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName?: string;
  credits: number;
  isOwner: boolean;
  active: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResellerCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName?: string;
  credits?: number;
  notes?: string;
}

export interface ResellerUpdatePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  active?: boolean;
  notes?: string;
}

export interface CreditOperationPayload {
  amount: number;
  note?: string;
}
