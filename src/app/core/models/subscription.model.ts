import { EndCustomer } from './end-customer.model';
import { Plan } from './plan.model';
import { Reseller } from './reseller.model';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'suspended';

export interface PlanSnapshot {
  name: string;
  serviceType: string;
  durationDays: number;
  capacity?: number;
  creditCost: number;
}

export interface Subscription {
  _id?: string;
  id?: string;
  endCustomer: string | Partial<EndCustomer>;
  soldBy: string | Partial<Reseller>;
  plan: string | Partial<Plan>;
  planSnapshot: PlanSnapshot;
  salePrice: number;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  credentials?: Record<string, string>;
  daysRemaining?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionCreatePayload {
  endCustomer: string;
  plan: string;
  soldBy?: string;
  salePrice: number;
  startDate?: string;
  credentials?: Record<string, string>;
  notes?: string;
}

export interface SubscriptionUpdatePayload {
  salePrice?: number;
  status?: SubscriptionStatus;
  credentials?: Record<string, string>;
  notes?: string;
}

export interface SubscriptionRenewPayload {
  plan?: string;
  salePrice?: number;
}

export interface SubscriptionStats {
  byStatus: Array<{ _id: SubscriptionStatus; count: number }>;
  byServiceType: Array<{ _id: string; count: number; revenue: number }>;
  totalRevenue: number;
  expiringInNext7Days: number;
}
