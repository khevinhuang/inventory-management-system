import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Users } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private subject: BehaviorSubject<Users | null>;
  public UserData: Observable<Users | null>;

  constructor(private router: Router, private http: HttpClient) {
    this.subject = new BehaviorSubject(
      JSON.parse(localStorage.getItem('user-list')!)
    );
    this.UserData = this.subject.asObservable();
  }

  public get value() {
    return this.subject.value;
  }

  login(username: string, password: string) {
    return this.http
      .post<Users>(`${environment.apiUrl}/login`, { username, password })
      .pipe(
        map((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.subject.next(user);
          return user;
        })
      );
  }

  logout() {
    localStorage.removeItem('user');
    this.subject.next(null);
    this.router.navigate(['/login']);
  }

  getAll() {
    return this.http.get<Users[]>(`${environment.apiUrl}/user-list`);
  }

  getById(id: string) {
    return this.http.get<Users>(`${environment.apiUrl}/user/${id}`);
  }

  update(id: string, params: any) {
    return this.http.put(`${environment.apiUrl}/user/${id}`, params).pipe(
      map((x) => {
        if (id == this.value?.id) {
          const user = { ...this.value, ...params };
          localStorage.setItem('user', JSON.stringify(user));
          this.subject.next(user);
        }
        return x;
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/user/${id}`).pipe(
      map((x) => {
        if (id == this.value?.id) {
          this.logout();
        }
        return x;
      })
    );
  }
}
