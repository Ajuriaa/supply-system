import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { IYearlyStatsResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardQueries {
  constructor(private http: HttpClient) {}

  public getYearlyStats(): Observable<IYearlyStatsResponse> {
    return this.http.get<IYearlyStatsResponse>(`${environment.apiUrl}/dashboard-top`);
  }
}
