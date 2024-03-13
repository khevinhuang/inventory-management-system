import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StoreList } from '../models';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private subject: BehaviorSubject<StoreList | null>;

  constructor(private http: HttpClient) {
    this.subject = new BehaviorSubject(
      JSON.parse(localStorage.getItem('store-list')!)
    );
  }

  public get value() {
    return this.subject.value;
  }

  getStoresData() {
    return this.http.get<StoreList[]>(`${environment.apiUrl}/store-list`);
  }

  getStoreDataHistory(id: string) {
    return this.http.get<StoreList>(`${environment.apiUrl}/store/${id}`);
  }

  addStoreData(data: StoreList) {
    return this.http.post(`${environment.apiUrl}/addStoreItem`, data);
  }

  updateStoreData(id: string, params: any) {
    return this.http.put(`${environment.apiUrl}/store/${id}`, params).pipe(
      map((x) => {
        if (id == this.value?.id) {
          const store = { ...this.value, ...params };
          this.subject.next(store);
        }
        return x;
      })
    );
  }

  deleteStoreData(id: string) {
    return this.http.delete(`${environment.apiUrl}/store/${id}`);
  }
}
