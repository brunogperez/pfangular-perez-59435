import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Subscription,
  SubscriptionCreatePayload,
  SubscriptionRenewPayload,
  SubscriptionStats,
  SubscriptionUpdatePayload
} from '../models';
import { environment } from '../../../environments/environment';

interface SubscriptionListOptions {
  status?: string;
  soldBy?: string;
  endCustomer?: string;
  plan?: string;
  serviceType?: string;
  expiringInDays?: number;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseURL}/api/subscriptions`;

  getAll(options: SubscriptionListOptions = {}): Observable<Subscription[]> {
    let params = new HttpParams();
    if (options.status) params = params.set('status', options.status);
    if (options.soldBy) params = params.set('soldBy', options.soldBy);
    if (options.endCustomer) params = params.set('endCustomer', options.endCustomer);
    if (options.plan) params = params.set('plan', options.plan);
    if (options.serviceType) params = params.set('serviceType', options.serviceType);
    if (options.expiringInDays !== undefined) params = params.set('expiringInDays', String(options.expiringInDays));
    return this.http.get<Subscription[]>(this.base, { params });
  }

  getStats(): Observable<SubscriptionStats> {
    return this.http.get<SubscriptionStats>(`${this.base}/stats/overview`);
  }

  getById(id: string): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.base}/${id}`);
  }

  create(payload: SubscriptionCreatePayload): Observable<Subscription> {
    return this.http.post<Subscription>(this.base, payload);
  }

  update(id: string, payload: SubscriptionUpdatePayload): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.base}/${id}`, payload);
  }

  renew(id: string, payload: SubscriptionRenewPayload = {}): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.base}/${id}/renew`, payload);
  }

  cancel(id: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.base}/${id}/cancel`, {});
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
