import { Injectable } from '@angular/core';
import { concatMap, Observable } from 'rxjs';
import { Product } from '../../features/dashboard/products/models/index';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  createProduct(data: Omit<Product, 'id'>): Observable<Product> {
    return this.httpClient.post<Product>(`${this.apiBaseURL}/api/products`, data);
  }

  getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.apiBaseURL}/api/products`);
  }

  getProductById(id: string): Observable<Product> {
    const result = this.httpClient.get<Product>(
      `${this.apiBaseURL}/api/products/${id}`
    );
    return result;
  }

  updateProductById(id: string, update: Partial<Product>) {
    return this.httpClient
      .patch<Product>(`${this.apiBaseURL}/api/products/${id}`, update)
      .pipe(concatMap(() => this.getProducts()));
  }

  removeProductById(id: string): Observable<Product[]> {
    return this.httpClient
      .delete<Product>(`${this.apiBaseURL}/api/products/${id}`)
      .pipe(concatMap(() => this.getProducts()));
  }
}
