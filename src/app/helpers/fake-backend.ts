import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, dematerialize, materialize } from 'rxjs/operators';

const userKey = 'user-list';
const storeKey = 'store-list';
const supplierKey = 'supplier-list';
const salesReportingKey = 'sales-reporting-list';

let users: Array<any> = JSON.parse(localStorage.getItem(userKey)!) || [];
let stores: Array<any> = JSON.parse(localStorage.getItem(storeKey)!) || [];
let suppliers: Array<any> =
  JSON.parse(localStorage.getItem(supplierKey)!) || [];
let reports: Array<any> =
  JSON.parse(localStorage.getItem(salesReportingKey)!) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    return handleRoute();

    function handleRoute() {
      switch (true) {
        //handle login case
        case url.endsWith('/login') && method === 'POST':
          return authenticate();
        case url.endsWith('/user-list') && method === 'GET':
          return getUsers();
        case url.match(/\/user\/\d+$/) && method === 'GET':
          return getUserById();
        case url.match(/\/user\/\d+$/) && method === 'PUT':
          return updateUser();
        case url.match(/\/user\/\d+$/) && method === 'DELETE':
          return deleteUser();
        //handle store case
        case url.endsWith('/addStoreItem') && method === 'POST':
          return addStoreList();
        case url.endsWith('/store-list') && method === 'GET':
          return getStoreList();
        case url.match(/\/store\/\d+$/) && method === 'GET':
          return viewStoreHistory();
        case url.match(/\/store\/\d+$/) && method === 'PUT':
          return updateStoreData();
        case url.match(/\/store\/\d+$/) && method === 'DELETE':
          return deleteStoreData();
        //handle supplier case
        case url.endsWith('/supplier-list') && method === 'GET':
          return getSupplierList();
        //handle sales reporting & alert stock case
        case url.endsWith('/sales-reporting') && method === 'GET':
          return getSalesReporting();
        default:
          return next.handle(request);
      }
    }

    function authenticate() {
      const { username, password } = body;
      const user = users.find(
        (x) => x.username === username && x.password === password
      );
      if (!user) return error('Username or password is incorrect');
      return ok({
        ...basicDetails(user),
        token: 'fake-jwt-token',
      });
    }

    function getUsers() {
      if (!isLoggedIn()) return unauthorized();
      return ok(users.map((x) => basicDetails(x)));
    }

    function getUserById() {
      if (!isLoggedIn()) return unauthorized();

      const user = users.find((x) => x.id === idFromUrl());
      return ok(basicDetails(user));
    }

    function updateUser() {
      if (!isLoggedIn()) return unauthorized();

      let params = body;
      let user = users.find((x) => x.id === idFromUrl());

      if (!params.password) {
        delete params.password;
      }
      Object.assign(user, params);
      localStorage.setItem(userKey, JSON.stringify(users));

      return ok();
    }

    function deleteUser() {
      if (!isLoggedIn()) return unauthorized();

      users = users.filter((x) => x.id !== idFromUrl());
      localStorage.setItem(userKey, JSON.stringify(users));
      return ok();
    }

    function ok(body?: any) {
      return of(new HttpResponse({ status: 200, body })).pipe(delay(500));
    }

    function error(message: string) {
      return throwError(() => ({ error: { message } })).pipe(
        materialize(),
        delay(500),
        dematerialize()
      );
    }

    function unauthorized() {
      return throwError(() => ({
        status: 401,
        error: { message: 'Unauthorized' },
      })).pipe(materialize(), delay(500), dematerialize());
    }

    function basicDetails(user: any) {
      const { id, username, role } = user;
      return {
        id,
        username,
        role,
      };
    }

    function isLoggedIn() {
      return headers.get('Authorization') === 'Bearer fake-jwt-token';
    }

    function idFromUrl() {
      const urlParts = url.split('/');
      return parseInt(urlParts[urlParts.length - 1]);
    }

    function getSalesReporting() {
      if (!isLoggedIn()) return unauthorized();
      return ok(reports.map((x) => salesReportingDetail(x)));
    }

    function salesReportingDetail(report: any) {
      const { id, itemName, qtySold, price, dateOfSale, total } = report;
      return {
        id,
        itemName,
        qtySold,
        price,
        dateOfSale,
        total,
      };
    }

    function getSupplierList() {
      if (!isLoggedIn()) return unauthorized();
      return ok(suppliers.map((x) => supplierDataDetail(x)));
    }

    function supplierDataDetail(supplier: any) {
      const { id, supplierName, supplierContact } = supplier;
      return {
        id,
        supplierName,
        supplierContact,
      };
    }

    function addStoreList() {
      const store = body;

      if (stores.find((x) => x.itemName === store.itemName)) {
        return error('Item  "' + store.itemName + '" is already exist');
      }
      store.id = store.length ? Math.max(...stores.map((x) => x.id)) + 1 : 1;
      stores.push(store);
      localStorage.setItem(storeKey, JSON.stringify(stores));
      return ok();
    }

    function getStoreList() {
      if (!isLoggedIn()) return unauthorized();
      return ok(users.map((x) => storeDataDetail(x)));
    }

    function storeDataDetail(store: any) {
      const {
        id,
        itemName,
        description,
        price,
        stock,
        supplierName,
        supplierContact,
      } = store;
      return {
        id,
        itemName,
        description,
        price,
        stock,
        supplierName,
        supplierContact,
      };
    }

    function viewStoreHistory() {
      if (!isLoggedIn()) return unauthorized();
      const store = stores.find((x) => x.id === idFromUrl());
      return ok(storeDataDetail(store));
    }

    function updateStoreData() {
      if (!isLoggedIn()) return unauthorized();

      let params = body;
      let store = stores.find((x) => x.id === idFromUrl());

      if (!params.password) {
        delete params.password;
      }
      Object.assign(store, params);
      localStorage.setItem(storeKey, JSON.stringify(stores));

      return ok();
    }

    function deleteStoreData() {
      if (!isLoggedIn()) return unauthorized();

      stores = stores.filter((x) => x.id !== idFromUrl());
      localStorage.setItem(storeKey, JSON.stringify(stores));
      return ok();
    }
  }
}

export const fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true,
};
