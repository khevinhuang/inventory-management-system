import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SupplierList } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private subject: BehaviorSubject<SupplierList | null>;

  constructor(private http: HttpClient) {
    this.subject = new BehaviorSubject(
      JSON.parse(localStorage.getItem('supplier-list')!)
    );
  }

  public get value() {
    return this.subject.value;
  }

  getSupplierData() {
    return this.http.get<SupplierList[]>(`${environment.apiUrl}/supplier-list`);
  }
}
