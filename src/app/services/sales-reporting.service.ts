import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SalesReporting } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SalesReportingService {
  private subject: BehaviorSubject<SalesReporting | null>;

  constructor(private http: HttpClient) {
    this.subject = new BehaviorSubject(
      JSON.parse(localStorage.getItem('sales-reporting')!)
    );
  }

  public get value() {
    return this.subject.value;
  }

  getReportData() {
    return this.http.get<SalesReporting[]>(
      `${environment.apiUrl}/sales-reporting`
    );
  }
}
