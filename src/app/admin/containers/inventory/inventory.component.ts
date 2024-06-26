import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { LoadingComponent, NoResultComponent, PrimaryButtonComponent } from 'src/app/shared';
import { NgxPaginationModule } from 'ngx-pagination';
import { SearchService } from 'src/app/core/services';
import { Model } from 'src/app/core/enums';
import moment from 'moment';
import { EMPTY_PRODUCT, PDFHelper } from 'src/app/core/helpers';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProductQueries } from '../../services';
import { IProduct } from '../../interfaces/product.interfaces';
import { CreateUpdateProductComponent, DeleteComponent } from '../../components';

const TABLE_COLUMNS = ['name', 'group', 'amount', 'unit', 'closestDueDate', 'price', 'actions'];

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, FormsModule,
    PrimaryButtonComponent, NoResultComponent, MatTableModule,
    NgxPaginationModule
  ],
  providers: [ProductQueries, PDFHelper],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  public loading = true;
  public searchInput = '';
  public displayedColumns: string[] = TABLE_COLUMNS;
  public products: IProduct[] = [];
  public filteredProducts: IProduct[] = [];
  public page = 1;
  public minAmount = 999;
  public minProduct: IProduct = EMPTY_PRODUCT;
  public dueProduct: IProduct = EMPTY_PRODUCT;

  constructor(
    private searchEngine: SearchService,
    private pdfHelper: PDFHelper,
    private productQuery: ProductQueries,
    private dialog: MatDialog,
    private router: Router
  ){}

  ngOnInit(): void {
    this.getAllProducts();
  }

  public onSearch(term: string): void {
    this.filteredProducts = this.searchEngine.filterData(this.products, term, Model.Product);
  }

  public getDueDate(product: IProduct): string {
    const date = product.batches.length > 0 ? moment(product.batches[0].due).format('DD/MM/YYYY') : 'Sin Unidades';
    return date;
  }

  public getAmount(product: IProduct): number {
    const amount = product.batches.length > 0 ? product.batches.reduce((acc, batch) => acc + batch.quantity, 0) : 0;
    if(amount < this.minAmount) {
      this.minAmount = amount;
      this.minProduct = product;
    }

    return amount;
  }

  public generatePDF(): void {
    this.pdfHelper.generateProductsPDF(this.filteredProducts);
  }

  public getPrice(product: IProduct): string {
    if (product.batches && product.batches.length > 0) {
      return "L." + product.batches[0].price;
    }
    return "N/A";
  }

  public openCreateUpdateProductModal(modalType: string = 'create', product: IProduct = EMPTY_PRODUCT): void {
    this.dialog.open(CreateUpdateProductComponent, {
      panelClass: 'dialog-style',
      data: { product, modalType }
    }).afterClosed().subscribe((result) => {
      if(result) {
        this.getAllProducts();
      }
    });
  }

  public openDeleteProductModal(productId: number): void {
    this.dialog.open(DeleteComponent, {
      panelClass: 'dialog-style',
      data: { id: productId, type: Model.Product }
    }).afterClosed().subscribe((result) => {
      if(result) {
        this.getAllProducts();
      }
    });
  }

  public goToInput(): void {
    this.router.navigate(['/admin/input/0']);
  }

  private getAllProducts(): void {
    this.productQuery.getAllProducts().subscribe(({ data }) => {
      this.products = data;
      this.filteredProducts = data;
      this.getClosestDueDate();
      this.loading = false;
    });
  }

  private getClosestDueDate(): void {
    const dueDates = this.products.map(product => {
      const due = product.batches.length > 0 ? product.batches[0].due : moment().endOf('year').toDate();
      const dueDate = new Date(due).getTime();
      return { product, dueDate };
    });

    const closestDueDate = dueDates.sort((a, b) => a.dueDate - b.dueDate)[0];
    this.dueProduct = closestDueDate.product;
  }
}
