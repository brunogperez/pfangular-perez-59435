import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EndCustomer, EndCustomerCreatePayload, EndCustomerUpdatePayload } from '../models';
import { environment } from '../../../environments/environment';

interface EndCustomerListOptions {
  reseller?: string;
  active?: boolean;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class EndCustomersService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseURL}/api/end-customers`;

  getAll(options: EndCustomerListOptions = {}): Observable<EndCustomer[]> {
    let params = new HttpParams();
    if (options.reseller) params = params.set('reseller', options.reseller);
    if (options.active !== undefined) params = params.set('active', String(options.active));
    if (options.search) params = params.set('search', options.search);
    return this.http.get<EndCustomer[]>(this.base, { params });
  }

  getById(id: string): Observable<EndCustomer> {
    return this.http.get<EndCustomer>(`${this.base}/${id}`);
  }

  create(payload: EndCustomerCreatePayload): Observable<EndCustomer> {
    return this.http.post<EndCustomer>(this.base, payload);
  }

  update(id: string, payload: EndCustomerUpdatePayload): Observable<EndCustomer> {
    return this.http.put<EndCustomer>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
