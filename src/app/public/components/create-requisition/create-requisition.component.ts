import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { IProduct } from 'src/app/admin/interfaces';
import { LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';
import { PublicQueries } from '../..';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EMPTY_PRODUCT } from 'src/app/core/helpers';
import { map, Observable, startWith } from 'rxjs';
import { SearchService } from 'src/app/core/services';
import { Model } from 'src/app/core/enums';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTableModule } from '@angular/material/table';

const TABLE_COLUMNS = ['product', 'group', 'quantity', 'unit'];

export interface IProductRequisition {
  product: IProduct;
  quantity: number;
}

export interface IProductRequisitionWithIds {
  id: number;
  productId: number;
  requisitionId: number;
  quantity: number;
}

@Component({
  selector: 'app-create-requisition',
  standalone: true,
  imports: [
    LoadingComponent, FormsModule, ReactiveFormsModule,
    MatInputModule, CommonModule, PrimaryButtonComponent,
    MatAutocompleteModule, AsyncPipe, MatFormFieldModule,
    NgxPaginationModule, MatTableModule
  ],
  templateUrl: './create-requisition.component.html',
  styleUrl: './create-requisition.component.scss',
})
export class CreateRequisitionComponent implements OnInit {
  public loading = false;
  public error = false;
  public products: IProduct[] = [];
  public filteredProducts!: Observable<IProduct[]>;
  public requisitionForm!: FormGroup;
  public displayedColumns: string[] = TABLE_COLUMNS;
  public selectedProduct: IProduct = EMPTY_PRODUCT;
  public productRequisitions: IProductRequisition[] = [];
  public page = 1;

  constructor(
    private publicQuery: PublicQueries,
    private formBuilder: FormBuilder,
    private searchEngine: SearchService
  ) {}

  ngOnInit(): void {
    this.requisitionForm = this.formBuilder.group({
      product: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(1)]],
    });
    this.filteredProducts = this.requisitionForm.controls.product.valueChanges.pipe(
      startWith(''),
      map(value => this.searchEngine.filterData(this.products, value.toString(), Model.Product)),
    );
    this.getProductList();
  }

  public selectProduct(product: IProduct): void {
    this.selectedProduct = product;
  }

  public addProduct(): void {
    this.error = false;
    if (this.requisitionForm.invalid) {
      this.error = true;
      return;
    }
    const productRequisition: IProductRequisition = {
      product: this.selectedProduct,
      quantity: this.requisitionForm.controls.quantity.value
    }
    this.productRequisitions.push(productRequisition);
    this.requisitionForm.controls.product.setValue('');
  }

  public async getProductList(): Promise<void> {
    this.publicQuery.getAllProducts().subscribe(({ data }) => {
      this.products = this.filterProducts(data);
      this.loading = false;
    });
  }

  public onSubmit(): void {}

  private filterProducts(products: IProduct[]): IProduct[] {
    return products.filter((product) => product.batches.reduce((acc, batch) => acc + batch.quantity, 0));;
  }
}
