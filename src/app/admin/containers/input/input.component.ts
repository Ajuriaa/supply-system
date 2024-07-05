import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { EMPTY_PRODUCT, EMPTY_SUPPLIER } from 'src/app/core/helpers';
import { SearchService } from 'src/app/core/services';
import { Model } from 'src/app/core/enums';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { FileDropComponent, LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';
import { ActivatedRoute } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import moment from 'moment';
import { ProductQueries, SuppliersQueries } from '../../services';
import { IProduct, ISupplier } from '../../interfaces';

const TABLE_COLUMNS = ['product', 'group', 'quantity', 'unit', 'price', 'dueDate', 'actions'];
export interface IEntryData {
  product: IProduct;
  quantity: number;
  price: number;
  dueDate: Date;
}
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    LoadingComponent, FormsModule, ReactiveFormsModule,
    MatInputModule, CommonModule, PrimaryButtonComponent,
    MatAutocompleteModule, AsyncPipe, MatFormFieldModule,
    NgxPaginationModule, MatTableModule, MatDatepickerModule,
    FileDropComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent implements OnInit {
  public loading = false;
  public error = false;
  public supplierControl = new FormControl('');
  public products: IProduct[] = [];
  public suppliers: ISupplier[] = [];
  public showProducts = false;
  public selectedSupplier: ISupplier = EMPTY_SUPPLIER;
  public filteredProducts!: Observable<IProduct[]>;
  public entryForm!: FormGroup;
  public requisitionForm!: FormGroup;
  public displayedColumns: string[] = TABLE_COLUMNS;
  public selectedProduct: IProduct = EMPTY_PRODUCT;
  public productEntries: any[] = [];
  public invoice!: File;
  public noInvoice = false;
  public page = 1;

  constructor(
    private formBuilder: FormBuilder,
    private searchEngine: SearchService,
    private dialog: MatDialog,
    private productQuery: ProductQueries,
    private supplierQuery: SuppliersQueries,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.entryForm = this.formBuilder.group({
      supplier: ['', [Validators.required]],
      date: ['', [Validators.required]],
    });
    this.requisitionForm = this.formBuilder.group({
      product: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      dueDate: ['', [Validators.required]]
    });
    this.filteredProducts = this.requisitionForm.controls.product.valueChanges.pipe(
      startWith(''),
      map(value => this.searchEngine.filterData(this.products, value.toString(), Model.Product)),
    );
    this.getProductList();
    this.getSuppliers();
  }

  public editProduct(entry: IEntryData): void {
    this.selectedProduct = entry.product;
    this.requisitionForm.controls.product.setValue(entry.product.name);
    this.requisitionForm.controls.quantity.setValue(entry.quantity);
    this.requisitionForm.controls.price.setValue(entry.price);
    this.requisitionForm.controls.dueDate.setValue(entry.dueDate);
    this.productEntries = this.productEntries.filter((product) => product.product.id !== entry.product.id);
  }

  public removeProduct(entry: IEntryData): void {
    this.productEntries = this.productEntries.filter((requisition) => requisition.product.id !== entry.product.id);
  }

  public selectProduct(product: IProduct): void {
    this.selectedProduct = product;
  }

  public selectSupplier(supplier: ISupplier): void {
    this.selectedSupplier = supplier;
  }

  public getFiles(files: File[]): void {
    this.invoice = files[0];
  }

  public getDate(date: Date): string {
    return moment.utc(date).format('DD/MM/YYYY');
  }

  public addProduct(): void {
    this.error = false;
    if (this.requisitionForm.invalid) {
      this.error = true;
      return;
    }
    const alreadyInTable = this.checkProductRequisition(this.selectedProduct, this.requisitionForm.controls.quantity.value);

    if(!alreadyInTable) {
      const productRequisition: IEntryData = {
        product: this.selectedProduct,
        quantity: this.requisitionForm.controls.quantity.value,
        price: this.requisitionForm.controls.price.value,
        dueDate: this.requisitionForm.controls.dueDate.value
      };
      this.productEntries.push(productRequisition);
    }
    this.requisitionForm.controls.product.setValue('');
    this.requisitionForm.controls.quantity.setValue(0);
    this.requisitionForm.controls.price.setValue(0);
    this.requisitionForm.controls.dueDate.setValue('');
  }

  public continue(): void {
    this.error = false;
    this.noInvoice = false;

    if(this.entryForm.invalid) {
      this.error = true;
      return;
    } else if(this.invoice === undefined) {
      this.noInvoice = true;
      return;
    }
    this.showProducts = true;
  }

  private async getProductList(): Promise<void> {
    this.productQuery.getAllProducts().subscribe(({ data }) => {
      this.products = data;
      this.loading = false;
    });
  }

  private checkProductRequisition(product: IProduct, quantity: number): boolean {
    const productIndex = this.productEntries.findIndex((productRequisition) => productRequisition.product.id === product.id);
    if (productIndex !== -1) {
      this.productEntries[productIndex].quantity += quantity;
      return true;
    }
    return false;
  }

  private getSuppliers(): void {
    const supplierId = +this.route.snapshot.params.id;
    this.supplierQuery.getAllSuppliers().subscribe(({ data }) => {
      this.suppliers = data;

      if(supplierId === 0) {
        this.selectedSupplier = EMPTY_SUPPLIER;
        return;
      }
      this.selectedSupplier = this.suppliers.find((supplier) => supplier.id === supplierId) || EMPTY_SUPPLIER;
      this.supplierControl.patchValue(this.selectedSupplier.name);
      this.showProducts = true;
    });
  }
}
