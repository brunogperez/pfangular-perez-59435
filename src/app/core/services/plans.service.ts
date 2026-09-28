import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan, PlanCreatePayload, PlanUpdatePayload } from '../models';
import { environment } from '../../../environments/environment';

interface PlanListOptions {
  active?: boolean;
  serviceType?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class PlansService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseURL}/api/plans`;

  getAll(options: PlanListOptions = {}): Observable<Plan[]> {
    let params = new HttpParams();
    if (options.active !== undefined) params = params.set('active', String(options.active));
    if (options.serviceType) params = params.set('serviceType', options.serviceType);
    if (options.search) params = params.set('search', options.search);
    return this.http.get<Plan[]>(this.base, { params });
  }

  getServiceTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/service-types`);
  }

  getById(id: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.base}/${id}`);
  }

  create(payload: PlanCreatePayload): Observable<Plan> {
    return this.http.post<Plan>(this.base, payload);
  }

  update(id: string, payload: PlanUpdatePayload): Observable<Plan> {
    return this.http.put<Plan>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
