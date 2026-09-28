export interface Plan {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  serviceType: string;
  durationDays: number;
  capacity?: number;
  creditCost: number;
  ownerPrice: number;
  suggestedResellerPrice: number;
  credentialFields?: string[];
  metadata?: Record<string, unknown>;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanCreatePayload {
  name: string;
  description?: string;
  serviceType: string;
  durationDays: number;
  capacity?: number;
  creditCost: number;
  ownerPrice: number;
  suggestedResellerPrice: number;
  credentialFields?: string[];
  metadata?: Record<string, unknown>;
  active?: boolean;
}

export type PlanUpdatePayload = Partial<PlanCreatePayload>;
