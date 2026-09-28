import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreditOperationPayload, CreditTransaction, Reseller, ResellerCreatePayload, ResellerUpdatePayload } from '../models';
import { environment } from '../../../environments/environment';

interface ResellerListOptions {
  includeOwner?: boolean;
  active?: boolean;
  search?: string;
}

interface CreditOperationResponse {
  reseller: Reseller;
  transaction: CreditTransaction;
}

@Injectable({ providedIn: 'root' })
export class ResellersService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseURL}/api/resellers`;

  getAll(options: ResellerListOptions = {}): Observable<Reseller[]> {
    let params = new HttpParams();
    if (options.includeOwner) params = params.set('includeOwner', 'true');
    if (options.active !== undefined) params = params.set('active', String(options.active));
    if (options.search) params = params.set('search', options.search);
    return this.http.get<Reseller[]>(this.base, { params });
  }

  getOwner(): Observable<Reseller> {
    return this.http.get<Reseller>(`${this.base}/owner`);
  }

  getById(id: string): Observable<Reseller> {
    return this.http.get<Reseller>(`${this.base}/${id}`);
  }

  create(payload: ResellerCreatePayload): Observable<Reseller> {
    return this.http.post<Reseller>(this.base, payload);
  }

  update(id: string, payload: ResellerUpdatePayload): Observable<Reseller> {
    return this.http.put<Reseller>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  topup(id: string, payload: CreditOperationPayload): Observable<CreditOperationResponse> {
    return this.http.post<CreditOperationResponse>(`${this.base}/${id}/credits/topup`, payload);
  }

  adjust(id: string, payload: CreditOperationPayload): Observable<CreditOperationResponse> {
    return this.http.post<CreditOperationResponse>(`${this.base}/${id}/credits/adjust`, payload);
  }
}
