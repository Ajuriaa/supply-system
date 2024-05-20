import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { IProductsResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProductsQueries {
  constructor(private http: HttpClient) {}

  public getAllDrivers(): Observable<IProductsResponse> {
    return this.http.get<IProductsResponse>(`${environment.apiUrl}/products`);
  }
}
