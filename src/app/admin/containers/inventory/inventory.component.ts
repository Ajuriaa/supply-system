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
import { ProductsQueries } from '../../services';
import { IProduct } from '../../interfaces/product.interfaces';

const TABLE_COLUMNS = ['name', 'group', 'amount', 'unit', 'closestDueDate', 'price', 'actions'];

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, FormsModule,
    PrimaryButtonComponent, NoResultComponent, MatTableModule,
    NgxPaginationModule
  ],
  providers: [ProductsQueries, PDFHelper],
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
    private productQuery: ProductsQueries
  ){}

  ngOnInit(): void {
      this.getAllProducts();
  }

  public onSearch(term: string): void {
    this.filteredProducts = this.searchEngine.filterData(this.products, term, Model.Product);
  }

  public getDueDate(product: IProduct): string {
    const date = product.batches[0].due;
    return moment(date).format('DD/MM/YYYY');
  }

  public getAmount(product: IProduct): number {
    const amount = product.batches.reduce((acc, batch) => acc + batch.quantity, 0);
    if(amount < this.minAmount) {
      this.minAmount = amount;
      this.minProduct = product;
    }

    return amount;
  }

  public generatePDF(): void {
    this.pdfHelper.generateProductsPDF(this.filteredProducts);
  }

  private getAllProducts(): void {
    this.productQuery.getAllDrivers().subscribe(({ data }) => {
      this.products = data;
      this.filteredProducts = data;
      this.getClosestDueDate();
      this.loading = false;
    });
  }

  private getClosestDueDate(): void {
    const dueDates = this.products.map(product => {
      const dueDate = new Date(product.batches[0].due).getTime();
      return { product, dueDate };
    });

    const closestDueDate = dueDates.sort((a, b) => a.dueDate - b.dueDate)[0];
    this.dueProduct = closestDueDate.product;
  }
}
