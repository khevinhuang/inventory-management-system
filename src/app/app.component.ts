import { Component } from '@angular/core';
import {
  Users,
  dummySalesReporting,
  dummyStoreList,
  dummySupplierList,
  dummyUserList,
} from './models';
import { UserService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  users?: Users | null;

  constructor(private userService: UserService) {
    this.userService.UserData.subscribe((x) => (this.users = x));
  }

  ngOnInit(): void {
    localStorage.setItem('user-list', JSON.stringify(dummyUserList));
    localStorage.setItem('store-list', JSON.stringify(dummyStoreList));
    localStorage.setItem('supplier-list', JSON.stringify(dummySupplierList));
    localStorage.setItem(
      'sales-reporting',
      JSON.stringify(dummySalesReporting)
    );
  }
}
