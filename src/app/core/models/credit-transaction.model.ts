import { Reseller } from './reseller.model';
import { Subscription } from './subscription.model';
import { User } from './user.model';

export type CreditTransactionType = 'topup' | 'consume' | 'refund' | 'adjustment';

export interface CreditTransaction {
  _id?: string;
  reseller: string | Partial<Reseller>;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  relatedSubscription?: string | Partial<Subscription>;
  performedBy?: string | Partial<User>;
  note?: string;
  createdAt?: string;
}
