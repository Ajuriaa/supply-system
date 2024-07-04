import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { EMPTY_PRODUCT, EMPTY_SUPPLIER } from 'src/app/core/helpers';
import { SearchService } from 'src/app/core/services';
import { IProduct, IProductRequisition, ISupplier } from '../../interfaces';
import { Model } from 'src/app/core/enums';
import { ProductQueries, SuppliersQueries } from '../../services';
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

const TABLE_COLUMNS = ['product', 'group', 'quantity', 'unit', 'price', 'dueDate', 'actions'];

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
  public productRequisitions: IProductRequisition[] = [];
  public requisitionCreated = false;
  public invoice!: File;
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

  public editProduct(productRequisition: IProductRequisition): void {
    this.selectedProduct = productRequisition.product;
    this.requisitionForm.controls.product.setValue(productRequisition.product.name);
    this.requisitionForm.controls.quantity.setValue(productRequisition.quantity);
    this.productRequisitions = this.productRequisitions.filter((product) => product.product.id !== productRequisition.product.id);
  }

  public removeProduct(productRequisition: IProductRequisition): void {
    this.productRequisitions = this.productRequisitions.filter((requisition) => requisition.product.id !== productRequisition.product.id);
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

  public addProduct(): void {
    this.error = false;
    if (this.requisitionForm.invalid) {
      this.error = true;
      return;
    }
    const alreadyInTable = this.checkProductRequisition(this.selectedProduct, this.requisitionForm.controls.quantity.value);

    // if(!alreadyInTable) {
    //   const productRequisition: IProductRequisition = {
    //     id: 0,
    //     requisition: ,
    //     product: this.selectedProduct,
    //     quantity: this.requisitionForm.controls.quantity.value
    //   };
    //   this.productRequisitions.push(productRequisition);
    // }
    this.requisitionForm.controls.product.setValue('');
    this.requisitionForm.controls.quantity.setValue(0);
  }

  public continue(): void {
    this.showProducts = true;
  }

  private async getProductList(): Promise<void> {
    this.productQuery.getAllProducts().subscribe(({ data }) => {
      this.products = data;
      this.loading = false;
    });
  }

  private checkProductRequisition(product: IProduct, quantity: number): boolean {
    const productIndex = this.productRequisitions.findIndex((productRequisition) => productRequisition.product.id === product.id);
    if (productIndex !== -1) {
      this.productRequisitions[productIndex].quantity += quantity;
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
      this.selectedSupplier = this.suppliers.find((supplier) => supplier.id === supplierId) || EMPTY_SUPPLIER
      this.supplierControl.patchValue(this.selectedSupplier.name);
      this.showProducts = true;
    });
  }
}
