import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreditTransaction, CreditTransactionType } from '../models';
import { environment } from '../../../environments/environment';

interface TransactionListOptions {
  reseller?: string;
  type?: CreditTransactionType;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class CreditTransactionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseURL}/api/credit-transactions`;

  getAll(options: TransactionListOptions = {}): Observable<CreditTransaction[]> {
    let params = new HttpParams();
    if (options.reseller) params = params.set('reseller', options.reseller);
    if (options.type) params = params.set('type', options.type);
    if (options.limit) params = params.set('limit', String(options.limit));
    return this.http.get<CreditTransaction[]>(this.base, { params });
  }
}
