import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { StoreService } from 'src/app/services';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent {
  addForm!: FormGroup;
  id?: string;
  title!: string;
  isloading: boolean = false;
  submitting: boolean = false;
  submitted: boolean = false;
  errorMessage?: string;

  currentRoute?: string;
  status?: string;
  isHide: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.route.url.subscribe((route) => {
      this.currentRoute = route[0].path;
    });
    this.id = this.route.snapshot.params['id'];
    this.addForm = this.formBuilder.group({
      itemName: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      stock: ['', [Validators.max(100), Validators.required]],
      supplierName: ['', Validators.required],
      supplierContact: ['', Validators.required],
    });

    if (this.id) {
      this.title = 'Edit Data';
      this.isloading = true;
      this.storeService
        .getStoreDataHistory(this.id)
        .pipe(first())
        .subscribe((x) => {
          this.addForm.patchValue(x);
          this.isloading = false;
        });
    }
    if (this.currentRoute === 'item-detail') {
      this.title = 'Item Detail';
      this.isHide = true;
      this.addForm.controls['itemName']?.disable();
      this.addForm.controls['description']?.disable();
      this.addForm.controls['price']?.disable();
      this.addForm.controls['stock']?.disable();
      this.addForm.controls['supplierName']?.disable();
      this.addForm.controls['supplierContact']?.disable();
    } else if (this.currentRoute === 'edit-item') {
      this.title = 'Edit Item';
    } else {
      this.title = 'Add New Item';
    }
  }

  get f() {
    return this.addForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.addForm.invalid) {
      return;
    }

    this.submitting = true;
    this.saveUser()
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigateByUrl('');
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error;
        },
      });
  }

  private saveUser() {
    return this.id
      ? this.storeService.updateStoreData(this.id!, this.addForm.value)
      : this.storeService.addStoreData(this.addForm.value);
  }

  onCancel() {
    this.router.navigate([''], { relativeTo: this.route });
  }
}
