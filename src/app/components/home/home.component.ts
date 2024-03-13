import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { StoreList, SupplierList, Users } from 'src/app/models';
import { StoreService, UserService } from 'src/app/services';
import { SalesReportingService } from 'src/app/services/sales-reporting.service';
import { SupplierService } from 'src/app/services/supplier.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  user?: Users | null;
  stores?: any;
  storesTotalData?: number;
  suppliers?: any;
  suppliersTotalData?: number;
  reporting?: any;
  reportTotalData?: number;

  storeDataSource: MatTableDataSource<StoreList>;
  supplierDataSource: MatTableDataSource<SupplierList>;
  reportingDataSource: MatTableDataSource<StoreList>;

  @ViewChild('storePaginator') storePaginator: MatPaginator | undefined;
  @ViewChild('supplierPaginator') supplierPaginator: MatPaginator | undefined;
  @ViewChild('reportPaginator') reportPaginator: MatPaginator | undefined;

  @ViewChild('storeSort') storeSort: MatSort | undefined;
  @ViewChild('supplierSort') supplierSort: MatSort | undefined;
  @ViewChild('reportSort') reportSort: MatSort | undefined;

  supplierDisplayedColumns: Array<string> = [
    'supplierName',
    'supplierContact',
    'description',
    'itemName',
  ];
  storeDisplayedColumns: Array<string> = [
    'itemName',
    'description',
    'price',
    'stock',
    'action',
  ];
  reportDisplayedColumns: Array<string> = [
    'itemName',
    'qtySold',
    'price',
    'dateOfSale',
    'total',
  ];

  alerts?: any[];
  limitStock: number = 30;

  showAlert: boolean = false;
  showReport: boolean = true;

  constructor(
    private router: Router,
    private userService: UserService,
    private storeService: StoreService,
    private supplierService: SupplierService,
    private reportService: SalesReportingService,
    private cdr: ChangeDetectorRef
  ) {
    this.userService.UserData.subscribe((x) => (this.user = x));

    this.stores = localStorage.getItem('store-list');
    this.storeDataSource = new MatTableDataSource(JSON.parse(this.stores));
    this.suppliers = localStorage.getItem('supplier-list');
    this.supplierDataSource = new MatTableDataSource(
      JSON.parse(this.suppliers)
    );
    this.reporting = localStorage.getItem('sales-reporting');
    this.reportingDataSource = new MatTableDataSource(
      JSON.parse(this.reporting)
    );
  }

  ngAfterViewInit(): void {
    this.cdr.checkNoChanges();
    this.storeDataSource.paginator = this.storePaginator || null;
    this.storeDataSource.sort = this.storeSort || null;

    this.supplierDataSource.paginator = this.supplierPaginator || null;
    this.supplierDataSource.sort = this.supplierSort || null;

    this.reportingDataSource.paginator = this.reportPaginator || null;
    this.reportingDataSource.sort = this.reportSort || null;
  }

  ngOnInit(): void {
    this.storeService
      .getStoresData()
      .pipe(first())
      .subscribe((store) => {
        this.stores = store;
        this.storesTotalData = store.length;
      });
    this.supplierService
      .getSupplierData()
      .pipe(first())
      .subscribe((supplier) => {
        this.suppliers = supplier;
        this.suppliersTotalData = supplier.length;
      });
    this.reportService
      .getReportData()
      .pipe(first())
      .subscribe((report) => {
        this.reporting = report;
        this.reportTotalData = report.length;
      });

    let tempStore = JSON.parse(
      JSON.stringify(localStorage.getItem('store-list'))
    );
  }

  updateAlerts() {
    this.alerts = [];
    this.storeDataSource.data.forEach((val: any) => {
      if (val.stock < this.limitStock) {
        this.alerts?.push(val);
      }
    });
  }

  onLimitStockChange(event: any): void {
    this.limitStock = event.target.value;
    this.updateAlerts();
  }

  onShowAlert() {
    this.showAlert = !this.showAlert;
  }

  onShowReport() {
    this.showReport = !this.showReport;
  }

  cssClass(stock: number) {
    return stock === 0 ? 'text-bg-danger' : 'text-bg-warning';
  }

  logout() {
    this.userService.logout();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.storeDataSource.filter = filterValue.trim().toLowerCase();

    if (this.storeDataSource.paginator) {
      this.storeDataSource.paginator.firstPage();
    }
  }

  onEdit(id: number) {
    this.router.navigate([`edit-item/${id}`]);
  }

  goItemDetail(id: number) {
    this.router.navigate([`item-detail/${id}`]);
  }

  deleteUser(id: any) {
    this.storeService
      .deleteStoreData(id)
      .pipe(first())
      .subscribe(() => {
        this.stores = this.stores!.filter((x: any) => x.id !== id);
        this.storesTotalData = this.stores?.length;
        this.storeDataSource.data = this.storeDataSource.data.filter(
          (item) => item.id != id
        );
        this.storeDataSource._updateChangeSubscription();
      });
  }

  get isDisabledButtonDelete() {
    return this.user?.role === 'STAFF';
  }
}
